import json
import boto3
import logging
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
purchases_table = dynamodb.Table('Purchases')

def lambda_handler(event, context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info('Received event: %s', json.dumps(event))
    
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Content-Type': 'application/json'
    }
    
    # Get UserId from query parameters
    user_id = (event.get('queryStringParameters') or {}).get('UserId')
    
    if not user_id:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"message": "UserId query parameter missing"})
        }
    
    try:
        # Query DynamoDB by UserId using GSI
        response = purchases_table.query(
            IndexName='UserId-index',
            KeyConditionExpression=Key('UserId').eq(user_id)
        )
        items = response.get('Items', [])
        
        logger.info('Found %d items for user %s', len(items), user_id)
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(items, default=str)  # default=str handles datetime
        }
    except Exception as e:
        logger.error('Error: %s', str(e))
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"message": "Internal server error", "error": str(e)})
        }
