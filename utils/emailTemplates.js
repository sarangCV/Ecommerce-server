exports.resetPassword = (url) => {
  return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Welcome Email</title>
      <style>
        h1{
            font-size: 30px;
            padding: 5px;
        }
        .button {
            background-color: #c30f0f;
            padding: 12px;
            width: fit-content;
            border-radius: 10px;
        }
        a {
            color: #fff;
            text-decoration: none;

        }
        a:hover {
            color: #3e3e3e;
          }
        a:hover .button {
        background-color: red;
        }
        a:visited {
            color: #000;
        }
      </style>
    </head>
    <body>
      <h1>Hello! </h1>
      <p>Please click the link below to reset your password. </p>
      <div class="button">
        <a href="${url}">Reset Password</a>
      </div>
    </body>
    </html>`;
};
