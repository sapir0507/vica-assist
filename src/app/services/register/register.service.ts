import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RegisterRequest } from './register.model';

@Injectable({ providedIn: 'root' })
export class RegisterService {

  private url = environment.api + 'login';

  constructor(
    private http: HttpClient
    ) {
  }

  private postRegister(request: RegisterRequest){
    return this.http.post<RegisterRequest>(this.url, request).pipe();
  }

  addRegister(newRequest: RegisterRequest): void{
    this.postRegister(newRequest).subscribe(data=>console.log(data))
  }

}
