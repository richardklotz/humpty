import AWS from 'aws-sdk';

export const handler = async (event, context) => {
	const stepFunctions = new AWS.StepFunctions();

	console.log('EVENT:', JSON.stringify(event, null, '\t'));

	const stateMachineArn = process.env.STATE_MACHINE_ARN;
	const params = {
		stateMachineArn,
		input: JSON.stringify(event),
	};

	const result = await stepFunctions.startExecution(params).promise();
	console.log('RESULT:', result);

	return result;
};
