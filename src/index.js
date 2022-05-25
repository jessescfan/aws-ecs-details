const { betterTaskDetails } = require('#services/format')

const args = process.argv.slice(2)
const profile = args.find((arg) => arg.includes('--profile'))?.split('=')[1] ?? 'default'
const serviceName = args.find((arg) => arg.includes('--service'))?.split('=')[1] ?? undefined
const region = args.find((arg) => arg.includes('--region'))?.split('=')[1] ?? 'us-east-1'

const init = async () => {
    try {
        const results = await betterTaskDetails({ profile, region, serviceName })

        //Console output
        Object.values(results).forEach((cluster) => {
            Object.keys(cluster).forEach((serviceKey) => {
                console.group(serviceKey)
                const tasks = cluster[serviceKey] //array

                tasks.forEach((task) => {
                    console.table({
                        [task.details.taskArn]: {
                            taskDefinitionArn: task.details.taskDefinitionArn,
                            connectivity: task.details.connectivity,
                        }
                    })

                    console.group()
                    const containerTable = task.containers.reduce((accCon, container) => {
                        const fields = ['name', 'healthStatus', 'image', 'lastStatus', 'cpu', 'memory']

                        accCon[container.name] = fields.reduce((accField, field) => {
                            accField[field] = container[field]

                            return accField
                        }, {})

                        return accCon
                    }, {})
                    console.table(containerTable)
                    console.groupEnd()
                })
                //serviceKey
                console.groupEnd()
            })
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