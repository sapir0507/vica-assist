import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

/**
 * Shared base for the app's "list a resource, filter by order id, create,
 * delete" HTTP clients (flights, hotels). Subclasses only supply the
 * resource URL and their own public method names/signatures - every HTTP
 * call and the error-handling shape was previously duplicated verbatim
 * across four separate services.
 */
@Injectable()
export abstract class HttpResourceService<T extends { id: number; orderID?: string }, TRequest> {
  protected abstract readonly resourceUrl: string;

  constructor(protected http: HttpClient) {}

  protected handleError(error: HttpErrorResponse, methodName?: string, obj?: unknown) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError('Something went wrong, please try again later.' + methodName + ' ' + obj);
  }

  protected getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.resourceUrl).pipe(
      catchError(err => this.handleError(err, 'getAll'))
    );
  }

  protected getByOrderID(orderID: string): Observable<T[]> {
    const params = new HttpParams().append('orderID', orderID);
    return this.http.get<T[]>(this.resourceUrl, { params });
  }

  protected create(request: TRequest): Observable<T> {
    return this.http.post<T>(this.resourceUrl, request).pipe(
      catchError(err => this.handleError(err, 'create', request))
    );
  }

  protected deleteById(id: number): void {
    this.http.delete<T>(`${this.resourceUrl}/${id}`).pipe(
      catchError(err => this.handleError(err, 'deleteById'))
    ).subscribe();
  }

  protected deleteByOrderID(orderID: string): void {
    this.getByOrderID(orderID).subscribe(items => {
      items.forEach(item => {
        if (item.orderID === orderID) this.deleteById(item.id);
      });
    });
  }
}
