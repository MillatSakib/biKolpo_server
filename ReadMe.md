# biKolpo (Backend)

Live Site Link: [https://bikolpo.netlify.app/](https://bikolpo.netlify.app/)

Client GitHub Link: [https://github.com/MillatSakib/biKolpo_Client](https://github.com/MillatSakib/biKolpo_Client)

## Prerequisite

- Must have install Node in your local machine for run this project.
- Must have Git for clone and push from GitHub.
- Must have Vercel installed if you want to deploy on vercel.

## Setup

For initializing this project you have to use the command below:

```sh
npm i
```

It will install all package and dependency need for your project. But it is not enough for run this project properly. You have to add a `.env` file in your root.
And the structure of the environment file are given below:

```env
DB_User="*********"
DB_Pass="*********"
Access_Token_Secret=*********
```

If you setup this project in this way The project will run properly.

### Deployment:

For first time deployment into vercel you have to follow the command bellow:

Step 1:

```sh
vercel login
```

Step 2:

```sh
vercel
```

Then fillup the requirement and press enter.

If you execute that command the in previous then you can execute the command bellow:

```sh
vercel --prod
```
