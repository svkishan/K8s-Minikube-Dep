# K8s-Minikube-Dep

PART 1: AWS EC2 SETUP (FROM ZERO)
STEP 1: Create EC2 Instance

Login to AWS Console

Go to EC2 → Launch Instance

Choose:

AMI: Ubuntu 22.04

Instance Type: t2.medium (recommended for Minikube)

Create Key Pair:

Name: minikube-key

Download .pem

Security Group:

SSH → 22

HTTP → 80

Custom TCP → 30000–32767

Launch instance

STEP 2: Connect to EC2
chmod 400 minikube-key.pem
ssh -i minikube-key.pem ubuntu@<EC2_PUBLIC_IP>
You are inside your EC2 Ubuntu server

 PART 2: INSTALL REQUIRED TOOLS
STEP 3: Install Docker
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker


Give permission:

sudo usermod -aG docker ubuntu
newgrp docker


Verify:

docker --version

STEP 4: Install kubectl
sudo apt install kubectl -y


Verify:

kubectl version --client

STEP 5: Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube


Verify:

minikube version

STEP 6: Start Minikube (IMPORTANT)

Minikube needs a driver → use Docker driver

minikube start --driver=docker


Check status:

minikube status


 Kubernetes is now running locally on EC2 

 PART 3: CREATE SIMPLE APPLICATION
STEP 7: Create Project Folder
mkdir k8s-demo
cd k8s-demo

STEP 8: Create Node.js App
app.js
nano app.js

const http = require("http");

http.createServer((req, res) => {
  res.end("Hello from Kubernetes on AWS EC2 ");
}).listen(3000);

package.json
nano package.json

{
  "name": "k8s-demo",
  "version": "1.0.0",
  "scripts": {
    "start": "node app.js"
  }
}

 PART 4: DOCKERIZE THE APP
STEP 9: Create Dockerfile
nano Dockerfile

FROM node:18
WORKDIR /app
COPY . .
CMD ["npm", "start"]

STEP 10: Build Docker Image

Tell Docker to use Minikube:

eval $(minikube docker-env)


Build image:

docker build -t k8s-demo-app .

 PART 5: KUBERNETES MANIFESTS
STEP 11: Create Deployment
nano deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: k8s-demo-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: k8s-demo
  template:
    metadata:
      labels:
        app: k8s-demo
    spec:
      containers:
      - name: k8s-demo
        image: k8s-demo-app
        ports:
        - containerPort: 3000

STEP 12: Create Service
nano service.yaml

apiVersion: v1
kind: Service
metadata:
  name: k8s-demo-service
spec:
  type: NodePort
  selector:
    app: k8s-demo
  ports:
  - port: 80
    targetPort: 3000

 PART 6: DEPLOY TO KUBERNETES
STEP 13: Apply Manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

STEP 14: Verify Pods & Services
kubectl get pods
kubectl get services


Expected:

k8s-demo-deployment   Running

STEP 15: Access Application
minikube service k8s-demo-service --url


Open URL in browser:

Hello from Kubernetes on AWS EC2 

 SUCCESS!

 INGRESS (DOMAIN-BASED ACCESS)
STEP 16: Enable Ingress
minikube addons enable ingress

STEP 17: Create Ingress File
nano ingress.yaml

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: k8s-demo-ingress
spec:
  rules:
  - host: k8s-demo.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: k8s-demo-service
            port:
              number: 80

STEP 18: Apply Ingress
kubectl apply -f ingress.yaml

STEP 19: Update Hosts File (EC2)

Get Minikube IP:

minikube ip


Edit hosts:

sudo nano /etc/hosts


Add:

<MINIKUBE-IP> k8s-demo.local

STEP 20: Access via Domain

From EC2:

curl http://k8s-demo.local


🎉 Ingress working!
