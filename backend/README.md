# Research Dashboard Backend

## Runtime configuration

Set these environment variables before starting the application:

```powershell
$env:SCOPUS_API_KEY="your-scopus-api-key"
$env:SCOPUS_INST_TOKEN="your-scopus-institution-token"
$env:DB_URL="jdbc:mysql://localhost:3306/scholarstack?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Bangkok"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-mysql-password"
```

The backend keeps provider credentials out of source control and reads them through `application.properties`.

If the MySQL user cannot create databases automatically, run `create-scholarstack.sql` once before starting the app.

Hibernate creates and updates the tables on startup. The current model includes users, lecturer profiles, articles, research projects, community services, grants, uploaded-publication metadata, and article relations.

## Available endpoints

- `GET /api/lecturers`
- `GET /api/lecturers/{lecturerId}/profile`
- `GET /api/lecturers/{lecturerId}/articles?source=scopus`
- `GET /api/lecturers/{lecturerId}/articles?source=googlescholar`
- `GET /api/lecturers/{lecturerId}/articles?source=sinta-googlescholar`
- `GET /api/lecturers/{lecturerId}/dashboard`
- `GET /api/lecturers/health`
- `POST /api/auth/login`
- `GET /api/data/users`
- `GET /api/data/articles?lecturerId=1&source=scopus`
- `GET /api/data/researches?lecturerId=1`
- `GET /api/data/services?lecturerId=1`
- `GET /api/data/grants`

## Seeded lecturers

- `1` - Erick Fernando
- `2` - Ririn Ikana Desanti

Seeded login accounts:

- `dosen01` / `password`
- `dosen02` / `password`
- `admin01` / `password`

## Notes

- Scopus uses the official Elsevier API.
- Google Scholar is read from the public profile page and may occasionally block automated requests.
- SINTA is read from public author pages; parser changes may be needed if SINTA changes its markup.
