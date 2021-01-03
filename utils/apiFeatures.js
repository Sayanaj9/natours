
class APIFeatures
{
  constructor(query,queryString)
  {
      this.query=query;
      this.queryString=queryString;
  }

  Filter()
  {
    const queryObj={...this.queryString};
    const excludingObj=['page','sort','limit','fields']
     excludingObj.forEach(el=>delete queryObj[el]) 
    
     //Advanced filtering
    let queryStr=JSON.stringify(queryObj);
    queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`);
   
    this.query=this.query.find(JSON.parse(queryStr));
   return this;
  }
  
Sorting()
{
    if(this.queryString.sort)
    {
          const sortBy=this.queryString.sort.split(',').join(' ');
          this.query=this.query.sort(sortBy)
    }
    else{
        this.query=this.query.sort('-createdAt')
    }
    return this
}

LimitFields()
{
    if(this.queryString.fields)
    {
        
        const fields=this.queryString.fields.split(',').join(' ');
        this.query=this.query.select(fields)
    }
    else{
        this.query=this.query.select('-__v'); //excluding _V
    }
    return this;

}

Paginate()
{
    const page=this.queryString.page*1||1;
    const limit=this.queryString.limit*1||100;
    const skip=(page-1)*limit
    this.query=this.query.skip(skip).limit(limit)
 return this;
    
}


}
module.exports=APIFeatures;