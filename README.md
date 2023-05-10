# Copyright-Public-Records-API
New: In progress Java API for scraping the copyright office public records

(For planning)
```mermaid
classDiagram

Parameter <|-- Subquery
Parameter <|-- TypeOfWork

class URLBuilder {
      -String base
      -HashMap~String|Parameter~ params
      
      +setParam(String)
      
      +buildUrl()
      
}     



class Parameter~T~ {
      -String key
      -String value
      -T param
      
      
      +toString()
}

class Subquery {
      
      -String queryTerm
      -String operatorType
      -String fieldHeading
      -String searchType
      
      +setQueryTerm();
      +setOperatorType();
      +setFieldHeading();
      +setSearchType();
      +toString();
}

class TypeOfWork {
      -String value
}


```

```java
enum ParamLabels {
      RECORDS_PER_PAGE,
      SUBQUERY,
      TYPE_OF_WORK,
      REGISTRATION_STATUS,
      REGISTRATION_CLASS,
      REGISTRATION_ITEM_TYPES,
      TYPE_OF_WORK,
      
}
```

URL BREAKDOWN
```
base:
      https://publicrecords.copyright.gov/advanced-search?
            records_per_page {int}
            
            subquery {
                  "queryTerm":"",
                  "operatorType:"",
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
