import { Body, Controller, Post } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserLoginInterface } from "src/interface/user.interface";
import { Users } from "src/model/users.model";
import { JwtAuthUtil } from "src/util/jwtAuth.util";
import { ResponseUtils } from "src/util/response.util";

@Controller('api/users')
export class UserController {
    constructor(private readonly jwtService: JwtService) {}

    @Post('login')
    public async login(@Body() body : UserLoginInterface): Promise<any> {
        const { email, password } = body.data;
        const user = new Users(undefined, undefined, email, password);
        const loggedInUser = await user.login();
        if(loggedInUser) {
            const token = JwtAuthUtil.generateToken(loggedInUser, this.jwtService);
            return ResponseUtils.success({ user: loggedInUser, token }, 'Login successful', 200);
        } else {
            return ResponseUtils.error('Login failed', 'Invalid credentials', null, 401);
        }
    }
}