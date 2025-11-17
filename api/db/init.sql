CREATE TABLE IF NOT EXISTS bikes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  registration TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  source_type TEXT NOT NULL,
  bike_id INTEGER,
  start_lat REAL,
  start_lon REAL,
  end_lat REAL,
  end_lon REAL,
  distance_km REAL,
  duration_minutes REAL,
  weather_summary TEXT,
  companions TEXT,
  notes TEXT,
  FOREIGN KEY (bike_id) REFERENCES bikes(id)
);
