import json
import boto3
import urllib3
import random

def lambda_handler(event, context):
    
    OPENSESRCH_ENDPOINT = 'https://search-a2photosearch-nk26ctmpjfuy2zjgj5z4fq42by.us-east-1.es.amazonaws.com'
    
    
    query_text = event['queryStringParameters']['q']
    query_list = lex_extrator(query_text= query_text)
    print(query_list)
    image_url_lists = opensearch_query(query_list, OPENSESRCH_ENDPOINT)
    random.shuffle(image_url_lists)
    


    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET'
        },
        'body': json.dumps(image_url_lists)
    }

    

def lex_extrator(query_text):
    
    client = boto3.client('lex-runtime')
    
    response = client.post_text(botName='wordextractor',
                                botAlias='search',
                                userId='single_request',
                                inputText=query_text)
                                
    query_list = []
  
    try:    
        query_list = [ label.lower() for label in list(response['slots'].values()) if label]
    except:
        print('label not define!!')

    return query_list
    
    
def opensearch_query(query_list, opensearch_endpoint):
    http = urllib3.PoolManager()
    headers = urllib3.make_headers(basic_auth='master:Passw0rd#')
    headers['Content-Type'] = 'application/json'
    endpoint = f'{opensearch_endpoint}/photos/_search/'
    
    urls = set()
    
    for label in query_list:
        search_json = json.dumps({
                    "from" : 0, "size" : 30,
                    "query": {
                        "function_score": {
                            "query": {
                                "match": {
                                    "labels": label
                                }
                        },
                        "random_score": {}
                
                        }
                  }
            })
        
        
        r = http.request('POST', endpoint, headers = headers, body=search_json)
        data = json.loads(r.data)
        
        try: 
            for hits in data['hits']['hits']:
                key = hits['_source']['objectKey']
                bucket = hits['_source']['bucket']
                urls.add(f'https://{bucket}.s3.amazonaws.com/{key}')
        except:
            print("Didn't Find Any Thing!")
            
    return list(urls)
