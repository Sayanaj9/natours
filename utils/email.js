const nodemailer=require('nodemailer');
const pug=require('pug');
const htmlToText=require('html-to-text');
const path = require('path')


module.exports=class Email{
    constructor(user,url){
        this.to=user.email;
        this.firstName=user.name.split(' ')[0];
        this.url=url;
        this.from=`Jonas Schmedtmann <${process.env.EMAIL_FROM}>`
    }
    newTransport()
    {
        if(process.env.NODE_ENV==='production')
        {
           return 1;
        }

        return nodemailer.createTransport({
            host:'smtp.mailtrap.io',
             port:process.env.EMAIL_PORT,
            auth:{
               user:process.env.EMAIL_USERNAME,
               pass:process.env.EMAIL_PASSWORD 
                 
              }
          })

    }

    //send the actual email
    async send(template,subject)
    {

         const filePath = path.join(__dirname, '..', 'views', 'emails', `${template}.pug`);

      
    // const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
    const html = pug.renderFile(filePath, {
            firstName:this.firstName,
            url:this.url,
            subject
        })

        //2)define email options

        const mailOptions= {
            from:this.from,
            to:this.to,
            subject,
            html,
            text:htmlToText.fromString(html)
    
        }

        await this.newTransport().sendMail(mailOptions)

        //3)create a transport and send email
    }
    async sendWelcome()
    {
        await this.send('welcome','welcome to the natours family')
    }
    async sendPasswordReset()
    {
        await this.send('PasswordReset','Your pwd reset token (valid only for 10 min')
    }
}

