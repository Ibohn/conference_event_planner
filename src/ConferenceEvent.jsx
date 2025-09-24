import React, { useState } from "react";
import "./ConferenceEvent.css";
import TotalCost from "./TotalCost";
import { toggleMealSelection } from "./mealsSlice";
import { incrementAvQuantity, decrementAvQuantity } from "./avSlice";
import { useSelector, useDispatch } from "react-redux";
import { incrementQuantity, decrementQuantity } from "./venueSlice";

const ConferenceEvent = () => {
  const [showItems, setShowItems] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const venueItems = useSelector((state) => state.venue);
  const avItems = useSelector((state) => state.av);
  const mealsItems = useSelector((state) => state.meals);
  const dispatch = useDispatch();

  const remainingAuditoriumQuantity =
    3 - venueItems.find(i => i.name === "Auditorium Hall (Capacity:200)").quantity;

  // --- Handlers
  const handleToggleItems = () => {
    console.log("handleToggleItems called"); // DEBUG
    setShowItems(v => !v);
  };

  const handleAddToCart = (index) => {
    if (venueItems[index].name === "Auditorium Hall (Capacity:200)" &&
        venueItems[index].quantity >= 3) return;
    dispatch(incrementQuantity(index));
  };
  const handleRemoveFromCart = (index) => {
    if (venueItems[index].quantity > 0) dispatch(decrementQuantity(index));
  };
  const handleIncrementAvQuantity = (index) => dispatch(incrementAvQuantity(index));
  const handleDecrementAvQuantity = (index) => dispatch(decrementAvQuantity(index));

  const handleMealSelection = (index) => {
    const item = mealsItems[index];
    if (item.selected && item.type === "mealForPeople") {
      const newNumberOfPeople = item.selected ? numberOfPeople : 0;
      dispatch(toggleMealSelection(index, newNumberOfPeople));
    } else {
      dispatch(toggleMealSelection(index));
    }
  };

  // --- Items pour le tableau
  const getItemsFromTotalCost = () => {
    const items = [];
    venueItems.forEach((item) => { if (item.quantity > 0) items.push({ ...item, type: "venue" }); });
    avItems.forEach((item) => {
      if (item.quantity > 0 && !items.some((i) => i.name === item.name && i.type === "av")) {
        items.push({ ...item, type: "av" });
      }
    });
    mealsItems.forEach((item) => {
      if (item.selected) {
        const itemForDisplay = { ...item, type: "meals" };
        if (item.numberOfPeople) itemForDisplay.numberOfPeople = numberOfPeople;
        items.push(itemForDisplay);
      }
    });
    return items;
  };
  const items = getItemsFromTotalCost();

  // --- Totaux
  const calculateTotalCost = (section) => {
    let totalCost = 0;
    if (section === "venue") {
      venueItems.forEach((item) => { totalCost += item.cost * item.quantity; });
    } else if (section === "av") {
      avItems.forEach((item) => { totalCost += item.cost * item.quantity; });
    } else if (section === "meals") {
      mealsItems.forEach((item) => { if (item.selected) totalCost += item.cost * numberOfPeople; });
    }
    return totalCost;
  };
  const venueTotalCost = calculateTotalCost("venue");
  const avTotalCost = calculateTotalCost("av");
  const mealsTotalCost = calculateTotalCost("meals");
  const totalCosts = { venue: venueTotalCost, av: avTotalCost, meals: mealsTotalCost };

  // --- DEBUG global (avant return)
  const debugPayload = { showItems, totals: totalCosts, items };
  console.log("---- DÉTAIL DES TOTAUX ----");
  console.log("Venue total:", venueTotalCost);
  console.log("AV total:", avTotalCost);
  console.log("Meals total:", mealsTotalCost);
  console.log("TOTAL attendu:", venueTotalCost + avTotalCost + mealsTotalCost);
  console.log("---- ITEMS ----");
  items.forEach((it) => {
    if (it.type === "meals") console.log(`${it.name} x ${numberOfPeople} = ${it.cost * numberOfPeople}`);
    else console.log(`${it.name} x ${it.quantity} = ${it.cost * it.quantity}`);
  });

  // --- Tableau
  const ItemsDisplay = ({ items }) => {
    console.log("ItemsDisplay receives:", items); // DEBUG
    return (
      <div className="display_box1">
        {items.length === 0 && <p>No items selected</p>}
        {items.length > 0 && (
          <table className="table_item_data">
            <thead>
              <tr>
                <th>Name</th><th>Unit Cost</th><th>Quantity</th><th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>${item.cost}</td>
                  <td>{(item.type === "meals" || item.numberOfPeople) ? ` For ${numberOfPeople} people` : item.quantity}</td>
                  <td>{(item.type === "meals" || item.numberOfPeople) ? (item.cost * numberOfPeople) : (item.cost * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const navigateToProducts = (idType) => {
    if (idType === '#venue' || idType === '#addons' || idType === '#meals') {
      if (showItems) setShowItems(false); // ferme le panneau si on navigue
    }
  };

  return (
    <>
      <navbar className="navbar_event_conference">
        <div className="company_logo">Conference Expense Planner</div>
        <div className="left_navbar">
          <div className="nav_links">
            <a href="#venue" onClick={() => navigateToProducts("#venue")}>Venue</a>
            <a href="#addons" onClick={() => navigateToProducts('#addons')}>Add-ons</a>
            <a href="#meals" onClick={() => navigateToProducts('#meals')}>Meals</a>
          </div>
          {/* Utilise le handler pour tracer */}
          <button className="details_button" onClick={handleToggleItems}>
            {showItems ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </navbar>

      <div className="main_container">
        {!showItems ? (
          <div className="items-information">
            {/* V E N U E */}
            <div id="venue" className="venue_container container_main">
              <div className="text"><h1>Venue Room Selection</h1></div>
              <div className="venue_selection">
                {venueItems.map((item, index) => (
                  <div className="venue_main" key={index}>
                    <div className="img"><img src={item.img} alt={item.name} /></div>
                    <div className="text">{item.name}</div>
                    <div>${item.cost}</div>
                    <div className="button_container">
                      {venueItems[index].name === "Auditorium Hall (Capacity:200)" ? (
                        <>
                          <button
                            className={venueItems[index].quantity === 0 ? "btn-warning btn-disabled" : "btn-minus btn-warning"}
                            onClick={() => handleRemoveFromCart(index)}
                          >&#8211;</button>
                          <span className="selected_count">{venueItems[index].quantity > 0 ? ` ${venueItems[index].quantity}` : "0"}</span>
                          <button
                            className={remainingAuditoriumQuantity === 0 ? "btn-success btn-disabled" : "btn-success btn-plus"}
                            onClick={() => handleAddToCart(index)}
                          >&#43;</button>
                        </>
                      ) : (
                        <div className="button_container">
                          <button
                            className={venueItems[index].quantity === 0 ? " btn-warning btn-disabled" : "btn-warning btn-plus"}
                            onClick={() => handleRemoveFromCart(index)}
                          >&#8211;</button>
                          <span className="selected_count">{venueItems[index].quantity > 0 ? ` ${venueItems[index].quantity}` : "0"}</span>
                          <button
                            className={venueItems[index].quantity === 10 ? " btn-success btn-disabled" : "btn-success btn-plus"}
                            onClick={() => handleAddToCart(index)}
                          >&#43;</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="total_cost">Total Cost: ${venueTotalCost}</div>
            </div>

            {/* A D D - O N S */}
            <div id="addons" className="venue_container container_main">
              <div className="text"><h1> Add-ons Selection</h1></div>
              <div className="addons_selection">
                {avItems.map((item, index) => (
                  <div className="av_data venue_main" key={index}>
                    <div className="img"><img src={item.img} alt={item.name} /></div>
                    <div className="text"> {item.name} </div>
                    <div> ${item.cost} </div>
                    <div className="addons_btn">
                      <button className="btn-warning" onClick={() => handleDecrementAvQuantity(index)}>&ndash;</button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button className=" btn-success" onClick={() => handleIncrementAvQuantity(index)}>&#43;</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="total_cost">Total Cost: {avTotalCost}</div>
            </div>

            {/* M E A L S */}
            <div id="meals" className="venue_container container_main">
              <div className="text"><h1>Meals Selection</h1></div>
              <div className="input-container venue_selection">
                <div className="input-container venue_selection">
                  <label htmlFor="numberOfPeople"><h3>Number of People:</h3></label>
                  <input
                    type="number"
                    className="input_box5"
                    id="numberOfPeople"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value || "1")))} // sécurisé
                    min="1"
                  />
                </div>
              </div>
              <div className="meal_selection">
                {mealsItems.map((item, index) => (
                  <div className="meal_item" key={index} style={{ padding: 15 }}>
                    <div className="inner">
                      <input
                        type="checkbox"
                        id={`meal_${index}`}
                        checked={item.selected}
                        onChange={() => handleMealSelection(index)}
                      />
                      <label htmlFor={`meal_${index}`}> {item.name} </label>
                    </div>
                    <div className="meal_cost">${item.cost}</div>
                  </div>
                ))}
              </div>
              <div className="total_cost">Total Cost: {mealsTotalCost}</div>
            </div>
          </div>
        ) : (
          <div className="total_amount_detail">
            <TotalCost
              totalCosts={totalCosts}
              ItemsDisplay={() => <ItemsDisplay items={items} />}
            />
            {/* DEBUG fallback si rien ne s’affiche */}
            <div style={{ marginTop: 8 }}>
              <details>
                <summary>Debug view</summary>
                <pre style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(debugPayload, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConferenceEvent;   
