import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Register, RegisterRequest } from './register.model';
import { RegisterStore } from './register.store';

@Injectable({ providedIn: 'root' })
export class RegisterService {

  private url: string = environment.api + 'login';


  constructor(
    private registerStore: RegisterStore, private http: HttpClient
    ) {
  }

  private postRegister(request: RegisterRequest){
    return this.http.post<RegisterRequest>(this.url, request).pipe();
  }

  addRegister(newRequest: RegisterRequest): void{
    this.postRegister(newRequest).subscribe(data=>console.log(data))
  }

  get() {
    let params: HttpParams = new HttpParams();

    return this.http.get<Register[]>(this.url).pipe(tap(entities => {
      this.registerStore.set(entities);
    }));
  }

  add(register: Register) {
    this.registerStore.add(register);
  }

  update(id: number, register: Partial<Register>) {
    this.registerStore.update(id, register);
  }

  remove(id: number) {
    this.registerStore.remove(id);
  }

}
