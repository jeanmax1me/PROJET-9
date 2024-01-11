/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import Bills from "../containers/Bills";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage";
import router from "../app/Router";
import MockedStore from '../__mocks__/store';
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"



jest.mock('../__mocks__/store');

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      const hasActiveIconClass = windowIcon.classList.contains('active-icon');
      
      expect(hasActiveIconClass).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  test("Then clicking on 'New Bill' button should navigate to the NewBill page", async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }));
  
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
  
    router();
    await window.onNavigate(ROUTES_PATH.Bills);
  
    // Wait for the "New Bill" button to appear in the DOM
    await waitFor(() => screen.getByTestId('btn-new-bill'));
  
    const buttonNewBill = screen.getByTestId('btn-new-bill');
    await buttonNewBill.dispatchEvent(new MouseEvent('click'));
  
    const newBillUrl = window.location.href.replace(/^https?:\/\/localhost\//, '');
    expect(newBillUrl).toBe('#employee/bill/new');
  });
});

describe("Additional Tests for Bills Component", () => {
  test('Constructor Initialization', () => {
    const billsInstance = new Bills({ document: document, onNavigate: jest.fn(), store: MockedStore });
    expect(billsInstance.document).toBe(document);
    expect(billsInstance.onNavigate).toBeDefined();
    expect(billsInstance.store).toBe(MockedStore);
  });

  test('handleClickIconEye shows modal', () => {
    const billsInstance = new Bills({ document: document, onNavigate: jest.fn(), store: MockedStore });
    const mockIcon = document.createElement('div');
    mockIcon.setAttribute('data-bill-url', 'mockBillUrl');
  
    // Mock the modal function directly on the prototype of window.$
    window.$.fn.modal = jest.fn();
  
    billsInstance.handleClickIconEye(mockIcon);
  
    // Checking if the modal function was called with the expected parameters
    expect(window.$.fn.modal).toHaveBeenCalledWith('show');
  });
  

  test('getBills calls store list and transforms data', async () => {
    const billsInstance = new Bills({ document: document, onNavigate: jest.fn(), store: MockedStore });

    const mockListData = [
      {
        id: '1',
        vat: '20',
        amount: 100,
        name: 'Test Bill 1',
      },
      {
        id: '2',
        vat: '10',
        amount: 150,
        name: 'Test Bill 2',
      },
    ];

    MockedStore.bills().list.mockResolvedValueOnce(mockListData);

    await billsInstance.getBills();

    // Assertions related to the transformed data
    // ...

    // Assertions related to the modal or other UI changes based on the data
    // ...

    // Assertions related to the length of bills (optional)
    // ...
  });
});
