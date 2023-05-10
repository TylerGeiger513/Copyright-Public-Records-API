# Copyright-Public-Records-API
New: In progress Java API for scraping the copyright office public records

(For planning)
```mermaid

```

URL BREAKDOWN
```
base:
      https://publicrecords.copyright.gov/advanced-search?
            records_per_page {int}
            
            subquery {
                  "queryTerm":"",
                  "fieldHeading":"Keyword",
                  "searchType":"As a Phrase",
                  "searchTypeReverseLookup":{"exact":"Is (exact)","starts_with":"Starts with","contains":"Contains","phrase":"As a Phrase"}
            }
           
           type_of_work { "all records" "registration" "recordation"} 
                        <--OPTIONAL-->
                  if type_of_work = registration
                        registration_status = { "published" "unpublished" "unspecified" }
                        registration_class = {TODO}
                        registration_item_types = {TODO}
                  
                  if type_of_work = recordation 
                        type_of_document = {TODO};
            
            page_number {int}
            
            date_field { "representative_date" "registration_date_as_date" "creation_date_as_year" "recordation_date_as_date" "execution_date_statement_as_date"}
                  if date_field != representative_date -> start_date && end_date are required
                  
                        start_date { Thu May 13 2004 00:00:00 GMT-0400 (Eastern Daylight Time) }
                        start_date { Thu May 13 2004 00:00:00 GMT-0400 (Eastern Daylight Time) }

             
            sort_field { "representative_date" "full_title" }
                  sort_order { "asc" "desc" }
            
            
```
