import requests
import xlsxwriter
import sys 
import json

def read_input():
    try:
        input_data = sys.stdin.read().strip()
        if not input_data:
            return {}
        print(input_data)
        return json.loads(input_data)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)

input_data = read_input()
token = input_data.get('accessToken') 
headers = {
    'Authorization': token
}
def fetch_agent_data():
    # Your API call ...
    agent_api = 'http://127.0.0.1:3000/api/un-log/agents'
    response = requests.get(agent_api, headers=headers)
    print(response)
    data = response.json()
    loggedin_count = data.get('loggedin_counts', 0)
    nonloggedin_count = data.get('nonLoggedin_counts', 0)

    return [
        ('Status', 'Count'),
        ('Logged-in Agents', loggedin_count),
        ('Non Logged-in Agents', nonloggedin_count)
    ]

def fetch_members_data():
    # Your API call ...
    member_api = 'http://127.0.0.1:3000/api/un-reg/members'
    response = requests.get(member_api, headers=headers)
    data = response.json()

    unreg_counts = data.get('unreg_counts', 0)
    reg_counts = data.get('reg_counts', 0)

    return [
        ('Status', 'Count'),
        ('Registered Members', reg_counts),
        ('Unregistered Members', unreg_counts)
    ]

def fetch_reinstated_data():
    reinstated_api = 'http://127.0.0.1:3000/api/reinstated'
    response = requests.get(reinstated_api, headers=headers)
    data = response.json()
    print(data)
    reinstated_count = data.get('total_reinstated', 0)
    other_count = data['others'][0].get('count', 0)
    return [
        ('Status', 'Count'),
        ('Reinstated Policies', reinstated_count),
        ('Other policies', other_count)
    ]

def fetch_policy_status_data():
    policy_status_api = 'http://127.0.0.1:3000/api/policystatus'
    payload = {"data":"YEAR"} 
    response = requests.post(policy_status_api, json=payload, headers=headers)
    data = response.json()
    policy_data = data.get('data', [])
    return policy_data

def fetch_tier_based_enroll_data():
    tier_based_api = 'http://127.0.0.1:3000/api/enrollments/tier'
    payload = {"data":"YEAR"} 
    response = requests.post(tier_based_api, json=payload, headers=headers)
    data = response.json()
    tier_based_data = data.get('data', [])
    return tier_based_data

def fetch_pltype_based_enroll_data():
    pltype_based_api = 'http://127.0.0.1:3000/api/enrollments/pltype'
    payload = {"data":"YEAR"} 
    response = requests.post(pltype_based_api, json=payload, headers=headers)
    data = response.json()
    pltype_based_data = data.get('data', [])
    return pltype_based_data

def write_data_with_pie_chart(filename):
    agent_data = fetch_agent_data()
    member_data = fetch_members_data()
    reinstated_data = fetch_reinstated_data()
    policy_data = fetch_policy_status_data()
    tier_based_data = fetch_tier_based_enroll_data()
    pltype_based_data = fetch_pltype_based_enroll_data()

    workbook = xlsxwriter.Workbook(filename)
    worksheet = workbook.add_worksheet('Data')

    # Define formats
    header_format = workbook.add_format({
        'bold': True,
        'font_color': 'white',
        'bg_color': '#4F81BD',
        'border': 1,
        'align': 'center',
        'valign': 'vcenter'
    })
    heading = workbook.add_format({
        'bold': True,
        'font_color': 'green',
        'bg_color': 'white',
        'border': 2,
        'border_color': 'green',
        'align': 'center',
        'valign': 'vcenter',
        'font_size': 14
    })

    border_format = workbook.add_format({
        'border': 1
    })

    # Write agent data header and rows with styling
    worksheet.merge_range('A1:B1', 'Agent Log-in Status', heading)
    worksheet.write_row('A2', agent_data[0], header_format)
    for i, row_data in enumerate(agent_data[1:], start=2):
        fmt = border_format
        if i % 2 == 0:
            # light fill for even rows
            fmt = workbook.add_format({'bg_color': '#DCE6F1', 'border': 1})
        worksheet.write_row(f'A{i+1}', row_data, fmt)

    # Write member data below agent data with some spacing
    start_row = len(agent_data) + 4
    worksheet.merge_range(start_row , 0, start_row, 1, 'Member Registration Status', heading)
    worksheet.write_row(start_row + 1, 0, member_data[0], header_format)
    for i, row_data in enumerate(member_data[1:], start=1):
        fmt = border_format
        if i % 2 == 0:
            fmt = workbook.add_format({'bg_color': '#DCE6F1', 'border': 1})
        worksheet.write_row(start_row + 1 + i, 0, row_data, fmt)

    policy_start_row = len(agent_data) + 4 + len(member_data) + 4
    worksheet.merge_range(policy_start_row, 0, policy_start_row, 1, 'Reinstated vs Other Policies', heading)
    worksheet.write_row(policy_start_row + 1, 0, reinstated_data[0], header_format)
    for i, row_data in enumerate(reinstated_data[1:], start=1):
        fmt = border_format
        if i % 2 == 0:
            # light fill for even rows
            fmt = workbook.add_format({'bg_color': '#DCE6F1', 'border': 1})
        worksheet.write_row(policy_start_row + 1 + i, 0, row_data, fmt)

    headers = ['Year', 'New Policy', 'Withdrawn Policy', 'Termed Policy', 'Reinstated Policy']
    worksheet.merge_range('A36:E36', 'Policy Status Table', heading)
    worksheet.write_row('A37', headers, header_format)
    for row_num, entry in enumerate(policy_data, start=37):
        fmt = border_format
        if (row_num % 2 == 0):
            fmt = workbook.add_format({'bg_color': '#DCE6F1', 'border': 1})
        worksheet.write(row_num, 0, entry['year'],fmt)
        worksheet.write(row_num, 1, int(entry['new_policy']), fmt)
        worksheet.write(row_num, 2, int(entry['withdrawn_policy']), fmt)
        worksheet.write(row_num, 3, int(entry['termed_policy']), fmt)
        worksheet.write(row_num, 4, int(entry['reinstated_policy']), fmt)

    tier_headers = ['Year', 'IO Tier', 'IF Tier', 'IS Tier', 'IC Tier']
    worksheet.merge_range('A68:E68', 'Tier Based Enrollments', heading)
    worksheet.write_row('A69', tier_headers, header_format)
    for row_num, entry in enumerate(tier_based_data, start=69):
        fmt = border_format
        if (row_num % 2 == 0):
            fmt = workbook.add_format({'bg_color': '#DCE6F1', 'border': 1})
        worksheet.write(row_num, 0, entry['year'],fmt)
        worksheet.write(row_num, 1, int(entry['IO_tier']), fmt)
        worksheet.write(row_num, 2, int(entry['IF_tier']), fmt)
        worksheet.write(row_num, 3, int(entry['IS_tier']), fmt)
        worksheet.write(row_num, 4, int(entry['IC_tier']), fmt)

    pl_headers = ['Year',
                'Limited Med',
                'Dental',
                'Medical',
                'Accident',
                'Critical',
                'Hospital',
                'Vision',
                'Lifestyle',
                'Term Life',
                'Supplemental',
                'Others']
    worksheet.merge_range('A100:L100', 'Plan-Type Based Enrollments', heading)
    worksheet.write_row('A101', pl_headers, header_format)
    for row_num, entry in enumerate(pltype_based_data, start=101):
        fmt = border_format
        if (row_num % 2 == 0):
            fmt = workbook.add_format({'bg_color': '#DCE6F1', 'border': 1})
        worksheet.write(row_num, 0, entry['year'],fmt)
        worksheet.write(row_num, 1, int(entry['limitedmed']), fmt)
        worksheet.write(row_num, 2, int(entry['dental']), fmt)
        worksheet.write(row_num, 3, int(entry['medical']), fmt)
        worksheet.write(row_num, 4, int(entry['accident']), fmt)
        worksheet.write(row_num, 5, int(entry['critical']), fmt)
        worksheet.write(row_num, 6, int(entry['hospital']), fmt)
        worksheet.write(row_num, 7, int(entry['vision']), fmt)
        worksheet.write(row_num, 8, int(entry['lifestyle']), fmt)
        worksheet.write(row_num, 9, int(entry['term_life']), fmt)
        worksheet.write(row_num, 10, int(entry['supplemental']), fmt)
        worksheet.write(row_num, 11, int(entry['others']), fmt)
    # Create pie charts with size adjustments
    pie_chart1 = workbook.add_chart({'type': 'pie'})
    pie_chart1.add_series({
        'name': 'Agent Login Status',
        'categories': ['Data', 2, 0, 3, 0],
        'values': ['Data', 2, 1, 3, 1],
        'data_labels': {'percentage': True},
    })
    pie_chart1.set_title({'name': 'Logged-in vs Non Logged-in Agents',    'name_font': {
        'size': 11,     # Set font size (e.g., 14 points)
        'name': 'Calibri',  # Optional: font name
        'bold': True,       # Optional: make title bold
        'color': '#333333'  # Optional: font color
    }})

    pie_chart2 = workbook.add_chart({'type': 'pie'})
    pie_chart2.add_series({
        'name': 'Member Registration Status',
        'categories': ['Data', start_row + 2, 0, start_row + 3, 0],
        'values': ['Data', start_row + 2, 1, start_row + 3, 1],
        'data_labels': {'percentage': True},
    })
    pie_chart2.set_title({'name': 'Registered vs Unregistered Members',    'name_font': {
        'size': 11,     # Set font size (e.g., 14 points)
        'name': 'Calibri',  # Optional: font name
        'bold': True,       # Optional: make title bold
        'color': '#333333'  # Optional: font color
    } })

    pie_chart3 = workbook.add_chart({'type': 'pie'})
    pie_chart3.add_series({
        'name': 'Reinstated vs Other Policies',
        'categories': ['Data', policy_start_row + 2, 0, policy_start_row + 3, 0],
        'values': ['Data', policy_start_row + 2, 1, policy_start_row + 3, 1],
        'data_labels': {'percentage': True},
    })
    pie_chart3.set_title({'name': 'Reinstated vs Other Policies',    'name_font': {
        'size': 11,     # Set font size (e.g., 14 points)
        'name': 'Calibri',  # Optional: font name
        'bold': True,       # Optional: make title bold
        'color': '#333333'  # Optional: font color
    } })

    policy_linechart = workbook.add_chart({'type': 'line'})
    for p_col_num in range(1, 5 ):
        policy_linechart.add_series({
            'name':       ['Data', 36, p_col_num],
            'categories': ['Data', 37, 0, len(policy_data)+36, 0],
            'values':     ['Data', 37, p_col_num, len(policy_data)+36, p_col_num],
            'line':       {'width': 1.25},
            'marker':     {'type': 'circle', 'size': 6},
        })
    policy_linechart.set_title({'name': 'Policy Status Line chart',    'name_font': {
        'size': 11,     # Set font size (e.g., 14 points)
        'name': 'Calibri',  # Optional: font name
        'bold': True,       # Optional: make title bold
        'color': '#333333'  # Optional: font color
    } })
    policy_linechart.set_x_axis({'name': 'Year'})
    policy_linechart.set_y_axis({'name': 'Count'})

    tier_linechart = workbook.add_chart({'type': 'line'})
    for col_num in range(1, 5 ):
        tier_linechart.add_series({
            'name':       ['Data', 68, col_num],
            'categories': ['Data', 69, 0, len(tier_based_data)+68, 0 ],
            'values':     ['Data', 69, col_num, len(tier_based_data)+68, col_num],
            'line':       {'width': 1.25},
            'marker':     {'type': 'circle', 'size': 6},
        })
    tier_linechart.set_title({'name': 'Chart of Tier based Enrolls',    'name_font': {
        'size': 11,     # Set font size (e.g., 14 points)
        'name': 'Calibri',  # Optional: font name
        'bold': True,       # Optional: make title bold
        'color': '#333333'  # Optional: font color
    } })
    tier_linechart.set_x_axis({'name': 'Year'})
    tier_linechart.set_y_axis({'name': 'Count'})

    pltype_linechart = workbook.add_chart({'type': 'bar', 'subtype': 'stacked'})
    for pl_col_num in range(1, 12):
        pltype_linechart.add_series({
            'name':       ['Data', 100, pl_col_num],
            'categories': ['Data', 101, 0, len(pltype_based_data)+100, 0],
            'values':     ['Data', 101, pl_col_num, len(pltype_based_data)+100, pl_col_num],
        })
    pltype_linechart.set_title({
        'name': 'Stacked Bar Chart of PlType based Enrolls',
        'name_font': {
            'size': 11,
            'name': 'Calibri',
            'bold': True,
            'color': '#333333'
        }
    })
    pltype_linechart.set_x_axis({'name': 'Count'})
    pltype_linechart.set_y_axis({'name': 'Year'})

    # Insert charts with size and offset (pixels)
    worksheet.insert_chart('D1', pie_chart1, {'x_scale': 0.7, 'y_scale': 0.7})
    worksheet.insert_chart('D12', pie_chart2, {'x_scale': 0.7, 'y_scale': 0.7})
    worksheet.insert_chart('D23', pie_chart3, {'x_scale': 0.7, 'y_scale': 0.7})
    worksheet.insert_chart('A46', policy_linechart, {'x_scale': 1.34, 'y_scale': 1.34})
    worksheet.insert_chart('A78', tier_linechart, {'x_scale': 1.34, 'y_scale': 1.34})
    worksheet.insert_chart('A110', pltype_linechart, {'x_scale': 1.5, 'y_scale': 1.5})
    # Optional: Set column widths for readability
    worksheet.autofit()


    workbook.close()

# Usage
write_data_with_pie_chart('data_analysis.xlsx')
