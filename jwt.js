import jsonwebtoken from "jsonwebtoken";
import config from './config.js';


export default 
{
    generateAccessToken: user => 
    {
        return jsonwebtoken.sign({data: {id:user._id}}, config.JWT_SECRET, {expiresIn: 86400})
    },
    
    generateRefreshToken: user => 
    {
        return jsonwebtoken.sign({data: {id:user._id}}, config.JWT_SECRET, {expiresIn: 8})
    },
    
    verifyToken: token => 
    {
        return jsonwebtoken.verify(token, config.JWT_SECRET, (err, decoded) => 
        {
            if(err && err.name === 'TokenExpiredError')
                return {error: err, data: null};
            if(err)
            return { error: err, data: null };
            return { error: null, data: decoded.data.id }
        });
    }
}


// module.exports.verifyToken = (req, res, next) =>
// {
//     let token = req.headers['x-access-token'];
//     if(!token)
//         return res.status(403).send("No token provided")

//     jwt.verify(token, config.JWT_SECRET, (err, decoded) => 
//     {
//         if(err && err.name === 'TokenExpiredError')
//             return res.status(403).send(err.message)
//         if(err)
//             return res.status(403).send(err.message)
//         req.userId = decoded.data.id
//     });
// };