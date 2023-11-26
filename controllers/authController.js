const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const {email, password} = req.body;

    try {      
        if (!email || !password) {
            return res.status(406).json({ message: 'Missing Fields'});
        }
    
        const user = await User.findOne({ email }).exec();
    
        if (!user) {
            return res.status(404).json({ message: 'Cannot find user'});
        }
    
        const confirmPassword= await bcrypt.compare(password, user.password);
    
        if (!confirmPassword) {
            return res.status(401).json({ message: 'Incorrect password or email'});
        }

        // const roles = Object.values(user.roles);
    
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "email": user.email,
                    "name": user.name,
                    "phoneNum": user.phoneNum,
                    "image": user.image,
                    "roles": user.roles,
                    "userId": user._id,
                }
            },
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '15m' },
    
        );
    
        const refreshToken = jwt.sign(
            { "email": user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );
    
        // create secure token with refresh token 
        res.cookie('jwt', refreshToken, {
            httpOnly: true, // accessible only web server
            secure: true, //https
            sameSite: 'None', // cross-site cookie
            maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to match refreshToken
        });
    
        // send accessToken containing email and roles and others 
        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}


const refresh = async (req, res) => {
    const cookies = req.cookies;

    try {
        if (!cookies?.jwt) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const refreshToken = cookies.jwt;
    
        // evaluate jwt 
        jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                try {                  
                    if (err) {
                        return res.status(403).json({ message: 'Forbidden' });
                    }
        
                    const user = await User.findOne({ email: decoded.email }).exec();
        
                    if (!user) {
                        return res.status(401).json({ message: 'Unauthorized' });
                    }

                    // const roles = Object.values(user.roles);

                    const accessToken = jwt.sign(
                        {
                            "UserInfo": {
                                "email": user.email,
                                "name": user.name,
                                "phoneNum": user.phoneNum,
                                "image": user.image,
                                "roles": user.roles,
                                "userId": user._id,
                            }
                        },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: '15m' }
                    );
        
                    res.json({ accessToken });
                } catch (error) {
                    res.status(500).json({ message: error.message });
                }
            }
        )
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const logout = async (req, res) => {
    const cookies = req.cookies;

    try {

        if (!cookies?.jwt) {
            return res.sendStatus(204) // no content
        }

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.json({ message: 'Cookie Cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { login, refresh, logout }