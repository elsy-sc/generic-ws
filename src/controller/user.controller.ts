import { Body, Controller, Post, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserLoginInterface } from "src/interface/user.interface";
import { Users } from "src/model/users.model";
import { JwtAuthUtil } from "src/util/jwtAuth.util";
import { ResponseUtil } from "src/util/response.util";

@Controller('api/users')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    
    constructor(private readonly jwtService: JwtService) {}

    @Post('login')
    public async login(@Body() body : UserLoginInterface): Promise<any> {
        this.logger.log('POST /api/users/login - User login requested');
        
        const { email, password } = body.data;
        this.logger.log(`Login attempt for email: ${email}`);
        
        const user = new Users(undefined, undefined, email, password);
        const loggedInUser = await user.login();
        
        if(loggedInUser) {
            const token = JwtAuthUtil.generateToken(loggedInUser, this.jwtService);
            this.logger.log(`Login successful for user: ${email}`);
            return ResponseUtil.success({ user: loggedInUser, token }, 'Login successful', 200);
        } else {
            this.logger.warn(`Login failed for user: ${email} - Invalid credentials`);
            return ResponseUtil.error('Login failed', 'Invalid credentials', null, 401);
        }
    }
}