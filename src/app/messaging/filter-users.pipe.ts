import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterUsers',
})
export class FilterUsersPipe implements PipeTransform {
  transform(users: any[], query: string): any[] {
    if (!query) return users; // If no query, return the full list
    query = query.toLowerCase(); // Convert query to lowercase for case-insensitive matching
    return users.filter(user =>
      user.name.toLowerCase().includes(query) // Match name with query
    );
  }
}

