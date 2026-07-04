const bcrypt = require('bcryptjs'); const hash = '\$2b\$12\$hOgR.07wFN27sBmgNAWppO0LbgpsD5Rykbud2qJYBa94qLCpacQjO'; bcrypt.compare('password123', hash).then(res => console.log('Match:', res));
