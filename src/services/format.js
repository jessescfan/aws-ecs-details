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

        const details = describeTasks['tasks'].reduce((acc, task) => {
            acc[task['group']] = acc[task['group']] ?? []
            const tasks = {
                details: task,
                containers: task['containers'],
            }

            acc[task['group']].push(tasks)
            return acc
        }, {})

        accCluster.push(details)
        return accCluster
    }, [])
}


module.exports = { betterTaskDetails }