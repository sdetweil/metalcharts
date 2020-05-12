#!/usr/bin/env python3

import sqlite3, csv
from pathlib import Path

TABLE_NAME = "edelmetallpreise"
DATA_PATH = Path("E:/APPDATA/Atom/Python/Data")
CSV_PATH = DATA_PATH / f"{TABLE_NAME}.csv"
DB_PATH = CSV_PATH.with_suffix(".db")

def from_db_to_csv(db_path, csv_path):
    """
    Liest die Daten aus der Datenbank ein und schreibt sie
    in eine .csv-Datei.
    Args:
        db_path: Pfad zur DB
        csv_path: Pfad zur .csv-Datei
    """
    with sqlite3.connect(db_path) as connection:
        cursor = connection.cursor()
        cursor.execute(f"SELECT gold,palladium,datum FROM {TABLE_NAME}")
        db_rows = cursor.fetchall()
        with open(csv_path, "w", newline = '') as csvfile:
            writer = csv.writer(csvfile)
            csvfile.write('gold,palladium,datum\n')
            for row in db_rows:
                writer.writerow(row)


def main():
    from_db_to_csv(DB_PATH,CSV_PATH)


if __name__ == "__main__":
    main()
