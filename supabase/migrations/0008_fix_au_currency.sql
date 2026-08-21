update universities
set currency = 'AUD'
where country_id = (select id from countries where code = 'AU')
  and currency = 'USD';
