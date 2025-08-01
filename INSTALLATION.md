# INSTALLATION

Make sure you installed and enabled:
nginx
postgresql
redis

# BACKEND:
```
git clone https://github.com/mr04hunter/neurocom.git
cd neurocom
python -m venv venv
source venv/bin/activate

pip install .[dev] (you can also "run pip install -r requirements.txt")
```

POSTGRESQL SETUP:
```
sudo -i -u postgres
psql
CREATE USER "your-username" WITH PASSWORD "your-password";
CREATE DATABASE neurocom OWNER "your-user";
GRANT ALL PRIVILEGES ON DATABASE neurocom TO "your-user";
```
Create .env file
`cp .env.example .env`
make sure you configure your database credentials you created above in .env 

## NGINX SETUP:
First you need to create a .conf file for your server
sudo nano /etc/nginx/sites-available/neurocom.conf

copy and paste this 

```nginx server {
    listen 80;
    server_name localhost;
    client_max_body_size 10M;

    # Deny direct access to upload directories
    location /srv/django_uploads/ {
        deny all;
        return 404;
    }


    location /media/ {
        deny all;
        return 404;
    }

 
    location ~ ^/uploads/ {
        deny all;
        return 404;
    }



    location /protected-media/ {
        internal;  # Only accessible via X-Accel-Redirect
        alias /srv/django_uploads/;  
        
        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
        add_header Cache-Control "private, no-cache, no-store, must-revalidate";
        
        # Handle different file types properly
        location ~* \.(jpg|jpeg|png|gif|webp|svg)$ {
            # Let Django set the correct Content-Type
            expires 1h;
        }
        
        location ~* \.(pdf|txt|doc|docx)$ {
            expires 1h;
        }
    }


    location /static/ {
        alias /home/your-username/your-project/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # All other requests to Django (including /secure-media/)
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

```

save and exit
And then we need to create a directory for user uploads

`sudo mkdir /srv/django_uploads`
And then we need to crate a group and add both your django user and www-data (nginx) to it and set up the permissions:
```
sudo groupadd neurocom
sudo usermod -aG neurocom "your-django-user"
sudo chown your-django-username:nuerocom /srv/django_uploads
sudo chmod 750 /srv/django_uploads
sudo chmod g+s /srv/django_uploads (this is needed since django will create new upload directories specific to each user)
```
then run:
`sudo nginx -t && sudo systemctl reload nginx`
you will se an output like `conf file is ok`

now back to /neurocom/backend/
```
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```



# FRONTEND
you just need to craete .env file which doesnt contain much only some addr variables and then you can install the dependencies
`npm i` NOTE some modules are deprecated you can ignore the errors this will be fixed in the future updates
`npm run dev`