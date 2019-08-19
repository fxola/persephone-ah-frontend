jest.unmock('axios');
import React from 'react';
import '@babel/polyfill';
import moxios from 'moxios';
import { mount, configure } from 'enzyme';
import { Provider } from 'react-redux';
import commentReducer from './createComment.reducer';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import {
  createCommentOnArticle,
  createCommentOnArticleStart,
  createCommentOnArticleSuccess
} from './createComment.action';
import { CreateComment, mapDispatchToProps } from './index.jsx';
import {
  CREATE_COMMENT_ON_ARTICLE_START,
  CREATE_COMMENT_ON_ARTICLE_SUCCESS
} from '../../actionTypes/index';

configure({ adapter: new Adapter() });

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

let store = mockStore({});
const response = {
  status: 'success',
  data: {
    id: 34,
    createdAt: '2019-08-13T08:04:23.738Z',
    updatedAt: '2019-08-13T08:04:23.738Z',
    slug: 'how-to-build-high-performance-teams-1',
    body: {
      'Tue Aug 13 2019 08:04:23 GMT+0000':
        'Please can you update the article to talk about the current changes'
    },
    highlightedText: null,
    author: {
      firstName: 'Halimah',
      lastName: 'Oladosu',
      following: false
    }
  }
};

describe('Create Comment Page', () => {
  describe('create comment actions', () => {
    beforeEach(() => moxios.install());
    afterEach(() => moxios.uninstall());
    it('dispatches getSingleArticleStart action', done => {
      const expectedActions = [{ type: 'CREATE_COMMENT_ON_ARTICLE_START' }];

      store.dispatch(createCommentOnArticleStart());

      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('dispatches createCommentOnArticleSuccess action', done => {
      const expectedActions = [
        { type: 'CREATE_COMMENT_ON_ARTICLE_START' },
        {
          type: 'CREATE_COMMENT_ON_ARTICLE_SUCCESS',
          comment: response.data
        }
      ];

      store.dispatch(createCommentOnArticleSuccess(response.data));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('dispatches getSingleArticle action', done => {
      const slug = 'how-to-build-high-performance-teams-1';
      const comment = 'some comment';
      const token = 'some-token';

      moxios.stubRequest(
        `https://persephone-backend-staging.herokuapp.com/api/v1/articles/${slug}/comments`,
        {
          status: 200,
          response: response
        }
      );

      const expectedActions = [
        { type: 'CREATE_COMMENT_ON_ARTICLE_START' },
        {
          type: 'CREATE_COMMENT_ON_ARTICLE_SUCCESS',
          comment: response.data
        },
        { type: 'CREATE_COMMENT_ON_ARTICLE_START' }
      ];

      store.dispatch(createCommentOnArticle(slug, comment, token));

      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('create comments reducer', () => {
    const initialState = {
      comment: null,
      loading: false
    };

    it('Should return default state', () => {
      const newState = commentReducer(undefined, {});
      expect(newState).toEqual(initialState);
    });

    it('Should return a new state if it recieves GET_SINGLE_ARTICLE_START in action type', () => {
      const state = {
        comment: null,
        loading: true
      };
      const newState = commentReducer(initialState, {
        type: CREATE_COMMENT_ON_ARTICLE_START
      });
      expect(newState).toEqual(state);
    });

    it('Should return a new state if it recieves GET_SINGLE_ARTICLE_SUCCESS in action type', () => {
      const expectedAction = {
        comment: response.data,
        loading: false
      };
      const newState = commentReducer(initialState, {
        type: CREATE_COMMENT_ON_ARTICLE_SUCCESS,
        comment: response.data,
        loading: false
      });

      expect(newState).toEqual(expectedAction);
    });
  });

  describe('create comment component', () => {
    it('should render read create comment component', done => {
      const props = {
        lightTheme: false,
        article: null,
        token: 'some-token'
      };
      const createComment = mount(
        <Provider store={store}>
          <BrowserRouter>
            <CreateComment {...props} />
          </BrowserRouter>
        </Provider>
      );
      const textarea = createComment.find('textarea');
      expect(textarea).toBeTruthy();
      done();
    });

    it('should render please login if not authenticated', done => {
      const props = {
        lightTheme: false,
        article: null,
        token: ''
      };
      const createComment = mount(
        <Provider store={store}>
          <BrowserRouter>
            <CreateComment {...props} />
          </BrowserRouter>
        </Provider>
      );
      const loginText = createComment.find('h4');
      expect(loginText.text()).toBe('Please Login to contribute.');
      done();
    });

    it('should fill the form and simulate a click on postcomment', done => {
      const props = {
        lightTheme: false,

        article: {
          slug: 'some-slug'
        },
        token: 'some-token',
        postComment: jest.fn()
      };
      const createComment = mount(
        <Provider store={store}>
          <BrowserRouter>
            <CreateComment {...props} />
          </BrowserRouter>
        </Provider>
      );
      createComment.find('textarea').simulate('change', {
        target: { name: 'comment', value: 'This article is awesome' }
      });

      createComment.find('form').simulate('submit', { preventDefault() {} }); // test to see arguments used after its been submitted
      expect(props.postComment.mock.calls.length).toBe(1);
      done();
    });

    it('should dispatch action', () => {
      const dispatch = jest.fn();
      mapDispatchToProps(dispatch).postComment();
      expect(typeof dispatch.mock.calls[0][0]).toEqual('function');
    });
  });
});
