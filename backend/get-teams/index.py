import json
import os
import psycopg

def handler(event: dict, context: any) -> dict:
    '''
    Business: Get all teams with current standings
    Args: event - dict with httpMethod, queryStringParameters (conference filter)
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with teams data
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
    conference = params.get('conference')
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg.connect(dsn)
    cur = conn.cursor()
    
    if conference:
        cur.execute('''
            SELECT id, name, city, emoji, conference, wins, losses, otl, points, badge, display_order
            FROM teams
            WHERE conference = '%s'
            ORDER BY points DESC, wins DESC, display_order
        ''' % conference)
    else:
        cur.execute('''
            SELECT id, name, city, emoji, conference, wins, losses, otl, points, badge, display_order
            FROM teams
            ORDER BY conference, points DESC, wins DESC, display_order
        ''')
    
    rows = cur.fetchall()
    
    teams = []
    for row in rows:
        teams.append({
            'id': row[0],
            'name': row[1],
            'city': row[2],
            'emoji': row[3],
            'conference': row[4],
            'wins': row[5],
            'losses': row[6],
            'otl': row[7],
            'points': row[8],
            'badge': row[9]
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'teams': teams}),
        'isBase64Encoded': False
    }
