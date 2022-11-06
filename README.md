## UD-Groups-Serverless
Udacity in class serverless project backend. It mainly consists of Lambda functions & other AWS resources getting deployed at CloudFormation Stack with the help of Serverless framework.

### Prerequites
1. Node v14.x
2. Serverless Framework
```
Framework Core: 3.24.1
Plugin: 6.2.2
SDK: 4.3.2
```

### Project Setup
1. Clone repository
2. Run `npm install`
3. Configure AWS user having sufficient permissions (Administrator Access for practice) using `aws configure`
4. Deploy stack to aws cloudformation with `sls deploy --aws-profile USERNAME --verbose`