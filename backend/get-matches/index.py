import json
import os
import psycopg

def handler(event: dict, context: any) -> dict:
    '''
    Business: Get all matches with team details
    Args: event - dict with httpMethod, queryStringParameters (status filter)
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with matches data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    status = params.get('status')
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg.connect(dsn)
    cur = conn.cursor()
    
    query = '''
        SELECT 
            m.id, 
            m.home_team_id, ht.name, ht.emoji,
            m.away_team_id, at.name, at.emoji,
            m.home_score, m.away_score,
            m.match_date, m.match_time, m.status
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
    '''
    
    if status:
        query += " WHERE m.status = '%s'" % status
    
    query += ' ORDER BY m.match_date, m.match_time'
    
    cur.execute(query)
    rows = cur.fetchall()
    
    matches = []
    for row in rows:
        matches.append({
            'id': row[0],
            'home_team': {
                'id': row[1],
                'name': row[2],
                'emoji': row[3]
            },
            'away_team': {
                'id': row[4],
                'name': row[5],
                'emoji': row[6]
            },
            'home_score': row[7],
            'away_score': row[8],
            'date': str(row[9]),
            'time': str(row[10]),
            'status': row[11]
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'matches': matches}),
        'isBase64Encoded': False
    }
