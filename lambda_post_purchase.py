import json
import uuid
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
purchases_table = dynamodb.Table('Purchases')

def lambda_handler(event, context):
    # Check if 'body' exists (API Gateway proxy event)
    body = event.get('body')
    if body:
        payload = json.loads(body)
    else:
        # Direct invocation with event as dict
        payload = event

    # Extract and convert input parameters to Decimal as required by DynamoDB
    user_id = payload['UserId']
    product_name = payload['ProductName']
    weight = Decimal(str(payload['Weight']))
    distance = Decimal(str(payload['ShippingDistance']))
    delivery_mode = payload.get('DeliveryMode', 'Standard')

    # Simple carbon emission calculation
    emission = weight * distance * Decimal('0.1')

    # Prepare item to store in DynamoDB
    item = {
        "PurchaseId": str(uuid.uuid4()),
        "UserId": user_id,
        "ProductName": product_name,
        "PurchaseDate": datetime.utcnow().isoformat(),
        "Weight": weight,
        "ShippingDistance": distance,
        "DeliveryMode": delivery_mode,
        "CarbonEmissionValue": emission
    }

    purchases_table.put_item(Item=item)

    # Return response with emission as float for JSON serialization
    return {
        "statusCode": 201,
        "body": json.dumps({
            "message": "Purchase logged successfully",
            "PurchaseId": item["PurchaseId"],
            "CarbonEmissionValue": float(emission)
        })
    }
