const { betterTaskDetails } = require('#services/format')

const args = process.argv.slice(2)
const profile = args.find((arg) => arg.includes('--profile'))?.split('=')[1] ?? 'default'
const serviceName = args.find((arg) => arg.includes('--service'))?.split('=')[1] ?? undefined
const region = args.find((arg) => arg.includes('--region'))?.split('=')[1] ?? 'us-east-1'

const init = async () => {
    try {
        const results = await betterTaskDetails({ profile, region, serviceName })

        Object.keys(results).forEach((clusterKey) => {
            const tasks = results[clusterKey]

            Object.keys(tasks).forEach((key) => {
                const task = tasks[key]
                console.group("Service:", key)
                Object.keys(task).forEach((taskKey) => {
                    console.group("Task:", taskKey)
                    console.table(task[taskKey])
                    console.groupEnd()
                })
                console.groupEnd()
            })
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