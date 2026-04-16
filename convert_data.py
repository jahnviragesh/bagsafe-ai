import pandas as pd
import os

# 1. Define where your files are
folder = 'datasets'
# We will use your biggest file as the main database
input_file = os.path.join(folder, 'flight_delay_predict.xlsx') 
output_file = os.path.join(folder, 'baggage_master.json')

print("Reading your dataset...")

try:
    # 2. Load the Excel file
    df = pd.read_excel(input_file)
    
    # 3. Keep it light so the website is fast
    # We take the first 500 rows for the demo
    df_sample = df.head(500)
    
    # 4. Convert to JSON
    df_sample.to_json(output_file, orient='records', indent=4)
    
    print(f"✅ Success! Your database is ready at: {output_file}")
except Exception as e:
    print(f"❌ Error: {e}")