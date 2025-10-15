import json
import os
import psycopg

def handler(event: dict, context: any) -> dict:
    '''
    Business: Update match results and recalculate team standings
    Args: event - dict with httpMethod, body containing match_id, home_score, away_score
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with updated match data
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    match_id = body_data.get('match_id')
    home_score = body_data.get('home_score')
    away_score = body_data.get('away_score')
    
    if not all([match_id is not None, home_score is not None, away_score is not None]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg.connect(dsn)
    cur = conn.cursor()
    
    cur.execute('''
        SELECT home_team_id, away_team_id, home_score AS old_home_score, away_score AS old_away_score, status
        FROM matches WHERE id = %s
    ''' % match_id)
    match_data = cur.fetchone()
    
    if not match_data:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Match not found'}),
            'isBase64Encoded': False
        }
    
    home_team_id, away_team_id, old_home_score, old_away_score, status = match_data
    
    if status == 'finished' and old_home_score is not None:
        if old_home_score > old_away_score:
            cur.execute('UPDATE teams SET wins = wins - 1, points = points - 2 WHERE id = %s' % home_team_id)
            if old_away_score == old_home_score - 1:
                cur.execute('UPDATE teams SET losses = losses - 1, otl = otl + 1, points = points + 1 WHERE id = %s' % away_team_id)
            else:
                cur.execute('UPDATE teams SET losses = losses - 1 WHERE id = %s' % away_team_id)
        elif old_away_score > old_home_score:
            cur.execute('UPDATE teams SET wins = wins - 1, points = points - 2 WHERE id = %s' % away_team_id)
            if old_home_score == old_away_score - 1:
                cur.execute('UPDATE teams SET losses = losses - 1, otl = otl + 1, points = points + 1 WHERE id = %s' % home_team_id)
            else:
                cur.execute('UPDATE teams SET losses = losses - 1 WHERE id = %s' % home_team_id)
    
    if home_score > away_score:
        cur.execute('UPDATE teams SET wins = wins + 1, points = points + 2 WHERE id = %s' % home_team_id)
        if away_score == home_score - 1:
            cur.execute('UPDATE teams SET otl = otl + 1, points = points + 1 WHERE id = %s' % away_team_id)
        else:
            cur.execute('UPDATE teams SET losses = losses + 1 WHERE id = %s' % away_team_id)
    elif away_score > home_score:
        cur.execute('UPDATE teams SET wins = wins + 1, points = points + 2 WHERE id = %s' % away_team_id)
        if home_score == away_score - 1:
            cur.execute('UPDATE teams SET otl = otl + 1, points = points + 1 WHERE id = %s' % home_team_id)
        else:
            cur.execute('UPDATE teams SET losses = losses + 1 WHERE id = %s' % home_team_id)
    
    cur.execute('''
        UPDATE matches 
        SET home_score = %s, away_score = %s, status = 'finished'
        WHERE id = %s
    ''' % (home_score, away_score, match_id))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'match_id': match_id,
            'home_score': home_score,
            'away_score': away_score
        }),
        'isBase64Encoded': False
    }
