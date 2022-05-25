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

        accCluster[cluster] = describeTasks['tasks'].reduce((acc, task) => {
            const containersData = task['containers'].reduce((cacc, container) => {
                const fields = ['healthStatus', 'image', 'lastStatus', 'cpu', 'memory', 'name']
                const contDetails = fields.reduce((facc, field) => {
                    facc[field] = container[field]

                    return facc
                }, {})
                const privateIpv4Address = container['networkInterfaces'].map((interface) => interface.privateIpv4Address).join(',')

                cacc[contDetails['name']] = { ...contDetails, privateIpv4Address }
                return cacc
            }, {})

            acc[task['group']] = { ...acc[task['group']], [task['taskArn']]: containersData }
            return acc
        }, {})

        return accCluster
    }, {})
}


module.exports = { betterTaskDetails }