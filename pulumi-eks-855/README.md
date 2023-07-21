Sample project for reproducing issue reported in https://github.com/pulumi/pulumi-eks/issues/855

Steps to run the program:
1. Clone the repo
2. Position yourself in the pulumi-eks-855 folder
3. Run `npm install` to install dependencies
4. Create a new stack called `parent`
5. Set config variable `vpcId`
6. Run `pulumi up --stack parent`
7. Create a new stack called `child`
8. Set config variable `vpcId` (same as step 5)
9. Run `pulumi up --stack child`

**NOTE**: `child` & `parent` stack must have the same password 

Running stack `child` after the `parent` stack should error out with the following error:
```
> pulumi up
Previewing update (child):
     Type                             Name                                      Plan       Info
 +   pulumi:pulumi:Stack              pulumi-eks-855-child                      create     2 errors
 +   └─ eks:index:NodeGroupV2         node01                                    create
 +      ├─ aws:ec2:SecurityGroup      node01-nodeSecurityGroup                  create
 +      ├─ aws:ec2:SecurityGroupRule  node01-eksNodeIngressRule                 create
 +      ├─ aws:ec2:SecurityGroupRule  node01-eksClusterIngressRule              create
 +      ├─ aws:ec2:SecurityGroupRule  node01-eksExtApiServerClusterIngressRule  create
 +      ├─ aws:ec2:SecurityGroupRule  node01-eksNodeInternetEgressRule          create
 +      └─ aws:ec2:SecurityGroupRule  node01-eksNodeClusterIngressRule          create


Diagnostics:
  pulumi:pulumi:Stack (pulumi-eks-855-child):
    error: TypeError: Cannot read properties of undefined (reading 'nodeSecurityGroup')
        at /mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/nodegroup.ts:967:32
        at /mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/output.ts:398:31
        at Generator.next (<anonymous>)
        at /mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/pulumi/output.js:21:71
        at new Promise (<anonymous>)
        at __awaiter (/mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/pulumi/output.js:17:12)
        at applyHelperAsync (/mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/pulumi/output.js:239:12)
        at /mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/output.ts:310:13
        at processTicksAndRejections (node:internal/process/task_queues:96:5)
    error: TypeError: Cannot read properties of undefined (reading 'data')
        at /mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/nodegroup.ts:1137:95
        at /mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/output.ts:398:31
        at Generator.next (<anonymous>)
        at /mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/pulumi/output.js:21:71
        at new Promise (<anonymous>)
        at __awaiter (/mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/pulumi/output.js:17:12)
        at applyHelperAsync (/mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/pulumi/output.js:239:12)
        at /mnt/c/git/github.com/klis/pulumi-samples/pulumi-eks-855/node_modules/@pulumi/output.ts:310:13
        at processTicksAndRejections (node:internal/process/task_queues:96:5)
```

To run the `child` stack without errors, @pulumi/eks package must be set to the version `0.42.7` in the `package.json` file.

Change the version, run `npm install` to pull the new dependency version and then run again `pulumi up --stack child`.
This should produce the correct output. 

