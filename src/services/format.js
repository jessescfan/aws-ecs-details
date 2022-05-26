const ecs = require('#services/aws/ecs')

const betterTaskDetails = async ({ profile, region, serviceName }) => {
    const client = new ecs.ECS({ profile, region })
    const clusters = await client.clusters()
    if (clusters['clusterArns'].length === 0) {
        throw new Error(`Could not find cluster for profile (${profile}) & region (${region})`)
    }

    return clusters['clusterArns'].reduce(async (accCluster, cluster) => {
        const services = await client.services({ cluster })
        const serviceNames = serviceName ? [serviceName] : services.serviceArns

        const describeServices = await client.describeServices({ cluster, services: serviceNames })

        const serviceData = await describeServices.services.reduce(async (accServices, service) => {
            const servicesAccumulator = await accServices
            const tasks = await client.tasks({ cluster, serviceName: service.serviceArn })
            const describeTasks = await client.describeTasks({ cluster, taskArns: tasks['taskArns'] ?? [] })
            const taskData = await describeTasks['tasks'].reduce(async (accTasks, task) => {
                const tasksAccumulator = await accTasks
                const result = await client.taskDefinition({ taskDefinition: task.taskDefinitionArn })
                const taskDefinitions = await client.taskDefinitions({ familyPrefix: result.taskDefinition.family })
                const tasks = {
                    details: { ...task, mostRecentTaskDefs: taskDefinitions.taskDefinitionArns },
                    containers: task['containers'],
                }

                tasksAccumulator.push(tasks)
                return tasksAccumulator
            }, [])

            servicesAccumulator.push({ details: service, tasks: taskData })

            return servicesAccumulator
        }, [])

        accCluster.push({ details: cluster, services: serviceData })
        return accCluster
    }, [])
}


module.exports = { betterTaskDetails }