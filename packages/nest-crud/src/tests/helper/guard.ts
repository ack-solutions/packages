import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';


@Injectable()
export class TestGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.query.allow === 'true';
    }

}
