import MenuSection from '../MenuSection/MenuSection';

const ResturantsWidget: React.FC = () => {
  const getRestaurants = (): JSX.Element[] => {
    return [
      {
        desc: 'The best burgers in town',
        id: 1,
        image:
          'https://images.unsplash.com/photo-1606131731446-5568d87113aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        title: 'Burgers',
      },
      {
        desc: 'The worst ice-cream around',
        id: 2,
        image:
          'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aWNlJTIwY3JlYW18ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        title: 'Ice Cream',
      },
      {
        desc: "This 'Za be gettin down",
        id: 3,
        image:
          'https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        title: 'Pizza',
      },
      {
        desc: "BBQ ain't need no rhyme",
        id: 4,
        image:
          'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8YmFyYmVxdWV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        title: 'BBQ',
      },
      {
        desc: "BBQ ain't need no rhyme",
        id: 5,
        image:
          'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8YmFyYmVxdWV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        title: 'BBQ',
      },
    ].map((restaurant: any) => {
      const styles: React.CSSProperties = {
        backgroundImage: `url(${restaurant.image})`,
      };

      return (
        <div
          key={restaurant.id}
          className="restaurant-card background-image"
          style={styles}
        >
          <div className="restaurant-card-content">
            <div className="restaurant-card-content-items">
              <span className="restaurant-card-title">{restaurant.title}</span>
              <span className="restaurant-card-desc">{restaurant.desc}</span>
            </div>
          </div>
        </div>
      );
    });
  };
  return (
    <MenuSection icon="fa-solid fa-burger" title="Get it delivered!">
      {getRestaurants()}
    </MenuSection>
  );
};

export default ResturantsWidget;
