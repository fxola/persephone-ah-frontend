import React from 'react';
import '@babel/polyfill';
import mockAxios from 'axios';
import { mount, configure } from 'enzyme';
import readArticleReducer from './readArticle.reducer';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import { rateArticleRequest } from './readArticle.action';
import { ReadArticle, mapDispatchToProps, mapStateToProps } from './index.jsx';
import {
  RATE_ARTICLE,
  RATE_ARTICLE_ERROR,
  CLEAN_UP_RATING
} from '../../actionTypes/index';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);
jest.mock('../../utils/checkAuth');

describe('Article Ratings actions tests', () => {
  let store;
  beforeEach(() => {
    store = mockStore({});
    jest.resetAllMocks();
  });
  afterEach(() => {
    store.clearActions();
  });

  it('Should dispatch The RATE_ARTICLE_ERROR and CLEAN_UP_RATING actions', async () => {
    const mockData = {
      status: 'fail',
      data: 'You need to sign in to rate this article'
    };

    mockAxios.post.mockResolvedValue({
      status: 200,
      data: mockData.data
    });

    const expectedActions = [
      {
        type: 'RATE_ARTICLE_ERROR',
        payload: {
          status: 'fail',
          data: 'You need to sign in to rate this article'
        }
      },
      { type: 'CLEAN_UP_RATING', payload: {} }
    ];

    await store.dispatch(
      rateArticleRequest(
        { rating: 4, articleId: 1 },
        'dkvjndfkvbndfnkvdfnvdmdkvndfkmvdk'
      )
    );
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('Should dispatch The RATE_ARTICLE_ERROR and CLEAN_UP_RATING actions', async () => {
    const mockData = {
      data: {
        rating: '4',
        articleId: 1
      }
    };

    mockAxios.post.mockResolvedValue({
      status: 200,
      data: mockData.data
    });

    const expectedActions = [
      { type: 'RATE_ARTICLE', payload: { rating: '4', articleId: 1 } },
      { type: 'CLEAN_UP_RATING', payload: {} }
    ];
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    await store.dispatch(
      rateArticleRequest(
        { rating: 4, articleId: 1 },
        'klrgkfmjdfdjbfdnjfdnvbdnvbndgnmf'
      )
    );
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('Article rating Reducer Tests', () => {
  const initialState = {
    article: { rating: {} },
    loading: false
  };
  it('Should return a new state if it recieves a RATE_ARTICLE action type', () => {
    const ratingResponse = {
      rating: 4,
      articleId: 1
    };
    const mockData = {
      ratingResponse
    };
    const newState = readArticleReducer(initialState, {
      type: RATE_ARTICLE,
      payload: ratingResponse
    });
    expect(newState).toEqual({
      ...initialState,
      article: { ...initialState.article, rating: mockData }
    });
  });

  it('Should return a new state if it recieves a RATE_ARTICLE_ERROR action type', () => {
    const ratingResponse = {
      status: 'fail',
      data: 'You need to sign in to rate this article'
    };
    const mockData = {
      ratingResponse
    };
    const newState = readArticleReducer(initialState, {
      type: RATE_ARTICLE_ERROR,
      payload: ratingResponse
    });
    expect(newState).toEqual({
      ...initialState,
      article: { ...initialState.article, rating: mockData }
    });
  });

  it('Should return a new state if it recieves a CLEAN_UP_RATING action type', () => {
    const ratingResponse = {};
    const mockData = {
      ratingResponse
    };
    const newState = readArticleReducer(initialState, {
      type: CLEAN_UP_RATING,
      payload: ratingResponse
    });
    expect(newState).toEqual({
      ...initialState,
      article: { ...initialState.article, rating: mockData }
    });
  });
});

describe('ReadArticle Page', () => {
  it('should dispatch rateArticleRequest action', done => {
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).rateArticleRequest();
    expect(typeof dispatch.mock.calls[0][0]).toEqual('function');
    done();
  });
  it('should dispatch cleanUpRating action', done => {
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).cleanUpRating();
    expect(typeof dispatch.mock.calls[0][0]).toEqual('object');
    done();
  });
});
