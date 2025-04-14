// packages/nest-crud/src/tests/helper/test.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class TestInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        // Modify the request object if needed
        request.headers['x-intercepted'] = 'true';

        return next.handle().pipe(
            map(data => {
                // Modify the response data if needed
                if (Array.isArray(data)) {
                    return data.map(item => ({
                        ...item,
                        intercepted: true,
                    }));
                }
                const updatedData = {
                    ...data,
                    intercepted: true,
                };
                return updatedData;
            }),
        );
    }

}
