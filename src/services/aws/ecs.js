const { ECSClient, ListClustersCommand, ListTasksCommand, DescribeTasksCommand } = require("@aws-sdk/client-ecs")
const { fromIni } = require("@aws-sdk/credential-providers")

class ECS {
    constructor({ profile, region }) {
        this.client = new ECSClient({ credentials: fromIni({ profile }), region });
    }

    clusters = async () => {
        const command = new ListClustersCommand({ maxResults: 10 })
        return await this.client.send(command)
    }

    tasks = async ({ cluster, serviceName }) => {
        const command = new ListTasksCommand({ cluster, serviceName })
        return await this.client.send(command)
    }

    describeTasks = async ({ cluster, taskArns = [] }) => {
        const command = new DescribeTasksCommand({
            maxResults: 10,
            cluster,
            tasks: taskArns
        })

        return await this.client.send(command)
    }
}

module.exports = { ECS }