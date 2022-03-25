import json
import boto3
import urllib3


def lambda_handler(event, context):
    
    OPENSESRCH_ENDPOINT = 'https://search-a2photosearch-nk26ctmpjfuy2zjgj5z4fq42by.us-east-1.es.amazonaws.com'
    
    key = event['Records'][0]['s3']['object']['key']
    bucket = event['Records'][0]['s3']['bucket']['name']
    
    print(bucket, key)
    
    label_list_reko = get_lebel_rekognition(key, bucket)
    label_list_custom = get_lebel_s3_metadata_public_access(key, bucket)
    
    json_object = {
        "objectKey": key,
        "bucket": bucket,
        "createdTimestamp": event['Records'][0]['eventTime'],
        "labels": list(set(label_list_custom) | set(label_list_reko)),
    }
    
    print(json_object)
    
    opensearch_store_object(json_object, OPENSESRCH_ENDPOINT)

    return {
        'statusCode': 200,
        'body': json.dumps('Added to Opensearch!')
    }


def get_lebel_rekognition(key, bucket):
    
    client = boto3.client('rekognition')
    response = client.detect_labels(Image={'S3Object':{'Bucket':bucket,'Name':key}}, MaxLabels=5)
    label_list = [lebel_details['Name'].lower() for lebel_details in response['Labels']]
    
    return label_list
 
def get_lebel_s3_metadata_public_access(key, bucket):
    
    s3 = boto3.resource('s3')
    object = s3.Object(bucket,key)

    label_list = object.metadata['customlabels'].split(',')
    label_list = [label.lower() for label in label_list]
    #public-read
    object.Acl().put(ACL='public-read')
    
    return label_list
    
def opensearch_store_object(json_object, opensearch_endpoint):
    
    http = urllib3.PoolManager()
    headers = urllib3.make_headers(basic_auth='master:Passw0rd#')
    headers['Content-Type'] = 'application/json'
    endpoint = f'{opensearch_endpoint}/photos/_doc/'
    http.request('POST', endpoint, headers = headers, body=json.dumps(json_object))
    
    
    