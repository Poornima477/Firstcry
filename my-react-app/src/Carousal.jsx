import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./Carousal.css";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 0 },
    items: 1
  }
};

function Carousal() {
  return (
  <div className="homepage-carousel">
  <Carousel
   responsive={responsive}
  infinite
  autoplay
  autoPlaySpeed={3000}
  transitionDuration={800}
  arrows={true}
  showDots={true}
  swipeable
  draggable
  >
  <div className="image">
    <img src="https://cdn.fcglcdn.com/brainbees/banners/dhp1771230010541.webp" />
    </div>

  <div className="image">
    <img src="https://cdn.fcglcdn.com/brainbees/banners/mktng_nonapps_base_scs_hp_20feb261771516363483.webp" />
    </div>

  <div className="image">
    <img src="https://cdn.fcglcdn.com/brainbees/banners/dhp1771230010541.webp" />
        </div>

    <div className="image">
    <img src="https://cdn.fcglcdn.com/brainbees/banners/dhp1770975639376.jpg" />
    </div>

  <div className="image">
  <img src="https://cdn.fcglcdn.com/brainbees/banners/dppppppp1767016842702.jpg" />
  </div>
       
       </Carousel>
    </div>
  );
}

export default Carousal;