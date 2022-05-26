const { betterTaskDetails } = require('#services/format')
const args = process.argv.slice(2)
const profile = args.find((arg) => arg.includes('--profile'))?.split('=')[1] ?? 'default'
const serviceName = args.find((arg) => arg.includes('--service'))?.split('=')[1] ?? undefined
const region = args.find((arg) => arg.includes('--region'))?.split('=')[1] ?? 'us-east-1'
const getLastItem = str => str.substring(str.lastIndexOf('/') + 1)

const init = async () => {
    try {
        const results = await betterTaskDetails({ profile, region, serviceName })

        //Console output
        results.forEach((cluster) => {
            //cluster
            console.group('Cluster', cluster.details)
            cluster.services.forEach((service) => {
                //service
                console.group('Service', service.details.serviceName)

                const deploymentTable = service.details.deployments.reduce((accDep, deployment) => {
                    const fields = ['desiredCount', 'runningCount', 'rolloutState', 'rolloutStateReason', 'taskDefinition', 'status', 'createdAt', 'updatedAt']

                    accDep.push(
                        fields.reduce((accField, field) => {
                            accField[field] = deployment[field]

                            return accField
                        }, [])
                    )

                    return accDep
                }, [])

                console.log('Deployments')
                console.table(deploymentTable)

                service.tasks.forEach((task) => {
                    //Containers
                    console.group('Containers')
                    const containerTable = task.containers.reduce((accCon, container) => {
                        const fields = ['name', 'healthStatus', 'image', 'lastStatus', 'cpu', 'memory']

                        accCon[container.name] = fields.reduce((accField, field) => {
                            accField[field] = container[field]

                            return accField
                        }, {})
                        accCon[container.name] = {
                            task: getLastItem(task.details.taskArn),
                            taskDefinitionArn: getLastItem(task.details.taskDefinitionArn),
                            mostRecentTaskDefs: getLastItem(task.details.mostRecentTaskDefs[0]),
                            ...accCon[container.name],
                        }

                        return accCon
                    }, {})

                    console.table(containerTable)

                    //Containers
                    console.groupEnd()
                })

                //service
                console.groupEnd()
            })

            //cluster
            console.groupEnd()
        })
    } catch (e) {
        console.error(`
        ********************************************************
        Error:
        ********************************************************
        ${e.name} | ${e.message}
        ********************************************************
        `)

        console.log(e)
    }
}

(async () => { await init() })()