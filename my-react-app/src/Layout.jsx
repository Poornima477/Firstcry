
import { Outlet } from "react-router-dom";
import "./Layout.css";

function  Layout(){
  return(
  <>
<div className="Container">

  <div  className="header">
  <ul>
    <li><a href="#categories"></a>ALL CATEGORIES</li>
    <li><a href="#boyfashion"></a>BOY FASHION</li>
    <li><a href="#girlgashion"></a>GIRL FASHION</li>
    <li><a href="#footwear"></a>FOOTWEAR</li>
    <li><a href="#toys"></a>TOYS</li>
    <li><a href="#diapering"></a>DIAPERING</li>
    <li><a href="#gear"></a>GEAR</li>
    <li><a href="#feeding"></a>FEEDING</li>
    <li><a href="#bath"></a>BATH</li>
    <li><a href="#nursery"></a>NURSERY</li>
    <li><a href="#moms"></a>MOMS</li>
    <li><a href="#health"></a>HEALTH</li>
    <li><a href="#boutiques"></a>BOUTIQUES</li>
  </ul>
</div>
</div>

  <Outlet/>

  </>
  );
}
export default Layout;




