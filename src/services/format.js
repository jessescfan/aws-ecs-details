const ecs = require('#services/aws/ecs')

const betterTaskDetails = async ({ profile, region, serviceName }) => {
    const client = new ecs.ECS({ profile, region })
    const clusters = await client.clusters()
    if (clusters['clusterArns'].length === 0) {
        throw new Error(`Could not find cluster for profile (${profile}) & region (${region})`)
    }

    return clusters['clusterArns'].reduce(async (accCluster, cluster) => {
        const tasks = await client.tasks({ cluster, serviceName })
        const describeTasks = await client.describeTasks({ cluster, taskArns: tasks['taskArns'] ?? [] })

        const details = await describeTasks['tasks'].reduce(async (acc, task) => {
            const accumulator = await acc
            const result = await client.taskDefinition({ taskDefinition: task.taskDefinitionArn })
            const taskDefinitions = await client.taskDefinitions({ familyPrefix: result.taskDefinition.family })
            accumulator[task['group']] = accumulator[task['group']] ?? []
            const tasks = {
                details: { ...task, mostRecentTaskDefs: taskDefinitions.taskDefinitionArns },
                containers: task['containers'],
            }

            accumulator[task['group']].push(tasks)
            return accumulator
        }, {})

        accCluster.push(details)
        return accCluster
    }, [])
}


module.exports = { betterTaskDetails }