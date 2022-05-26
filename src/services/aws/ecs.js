const {
    DescribeServicesCommand,
    DescribeTaskDefinitionCommand,
    DescribeTasksCommand,
    ECSClient,
    ListClustersCommand,
    ListServicesCommand,
    ListTaskDefinitionsCommand,
    ListTasksCommand
} = require("@aws-sdk/client-ecs")
const { fromIni } = require("@aws-sdk/credential-providers")

class ECS {
    constructor({ profile, region }) {
        this.client = new ECSClient({ credentials: fromIni({ profile }), region });
    }

    clusters = async () => {
        const command = new ListClustersCommand({ maxResults: 10 })
        return await this.client.send(command)
    }

    services = async ({ cluster }) => {
        const command = new ListServicesCommand({ cluster, maxResults: 10 })
        return await this.client.send(command)
    }

    describeServices = async ({ cluster, services }) => {
        const command = new DescribeServicesCommand({ cluster, services, maxResults: 10 })
        return await this.client.send(command)
    }

    tasks = async ({ cluster, serviceName }) => {
        const command = new ListTasksCommand({ cluster, serviceName })
        return await this.client.send(command)
    }

    taskDefinition = async ({ taskDefinition }) => {
        const command = new DescribeTaskDefinitionCommand({ taskDefinition })

        return await this.client.send(command)
    }

    taskDefinitions = async ({ familyPrefix, maxResults = 1, sort = 'DESC' }) => {
        const command = new ListTaskDefinitionsCommand({ sort, maxResults, familyPrefix })

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