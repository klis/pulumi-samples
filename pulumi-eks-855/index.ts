import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";

const stackName = pulumi.getStack()

const vpcId = new pulumi.Config().require('vpcId')

const privateSubnets = aws.ec2.getSubnetsOutput({
    filters: [
        {
            name: 'tag:type',
            values: [
                'private'
            ]
        },
        {
            name: 'vpc-id',
            values: [
                vpcId
            ]
        }
    ]
})

export let cluster: eks.Cluster
export let instanceProfile: aws.iam.InstanceProfile
if ("parent" === stackName) {
    const eksClusterRole = new aws.iam.Role("eks-role", {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
            Service: "ec2.amazonaws.com",
        })
    })

    new aws.iam.RolePolicyAttachment("eksClusterRoleAttachment-0", {
        policyArn: "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        role: eksClusterRole
    })

    new aws.iam.RolePolicyAttachment("eksClusterRoleAttachment-1", {
        policyArn: "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        role: eksClusterRole
    })

    new aws.iam.RolePolicyAttachment("eksClusterRoleAttachment-2", {
        policyArn: aws.iam.ManagedPolicy.AmazonEC2ContainerRegistryReadOnly,
        role: eksClusterRole
    })

    new aws.iam.RolePolicyAttachment("eksClusterRoleAttachment-3", {
        policyArn: "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy",
        role: eksClusterRole
    })

    instanceProfile = new aws.iam.InstanceProfile("eks-instanceProfile", {
        role: eksClusterRole
    })

    cluster = new eks.Cluster('parent', {
        createOidcProvider: true,
        desiredCapacity: 2,
        instanceRoles: [
            eksClusterRole
        ],
        instanceType: "t3.micro",
        maxSize: 5,
        minSize: 1,
        nodeAssociatePublicIpAddress: false,
        nodeRootVolumeSize: 20,
        privateSubnetIds: privateSubnets.ids,
        skipDefaultNodeGroup: true,
        version: "1.26",
        vpcId: vpcId,
    })
}

if ('child' === stackName) {
    const stackReference = new pulumi.StackReference("parent")

    const cluster = (stackReference.requireOutput("cluster") as unknown) as eks.Cluster
    const instanceProfile = (stackReference.requireOutput("instanceProfile") as unknown) as aws.iam.InstanceProfile

    pulumi.output(cluster).apply(unwrapped => {

        unwrapped.core.eksNodeAccess = undefined
        unwrapped.core.vpcCni = undefined

        const node = new eks.NodeGroupV2("node01", {
            amiId: 'ami-075756de6a096f7df',
            autoScalingGroupTags: {
                "Provider": "Pulumi",
                "Environment": "test",
                "Customer": "reversinglabs",
                "Owner": "TitaniumCore DevOps",
                "Service": "SDLC",
                "Usage": "EKS Node",
                "Project": "SDLC"
            },
            cluster: unwrapped,
            instanceProfile: instanceProfile,
            instanceType: "t3.micro",
            desiredCapacity: 1,
            maxSize: 5,
            minSize: 1,
            nodeAssociatePublicIpAddress: false,
            nodeRootVolumeSize: 20,
            nodeRootVolumeType: "gp3",
            nodeSubnetIds: privateSubnets.ids
        })
    })
}
