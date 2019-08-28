import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
  getSingleArticle,
  rateArticleRequest,
  cleanUpRating,
  articleLike,
  reportArticleRequest
} from './readArticle.action';
import PropTypes from 'prop-types';
import IconComponent from '../../components/IconComponent/index.jsx';
import './ReadArticlePage.scss';
import StarRatingComponent from 'react-star-rating-component';
import CreateComment from '../../components/CreateComment/index.jsx';
import Authorcard from '../../components/AuthorCard/index.jsx';
import Loading from '../../components/LoadingIndicator/index.jsx';

import ReportArticleForm from '../../components/ReportArticle/index.jsx';
import ReportModal from '../../components/Modal/index.jsx';
import reactHtmlParser from 'react-html-parser';
import { createBookmark } from '../../views/BookmarkPage/bookmark.action';
import ToolTip from 'react-tooltip';

export class ReadArticle extends Component {
  state = {
    user: {},
    slug: '',
    show: false
  };

  componentDidMount() {
    const user = JSON.parse(localStorage.getItem('user'));
    const { slug } = this.props.match.params;
    this.setState({ user, slug });
    this.props.fetchSingleArticle(slug);
  }

  handleCreateBookmark = async () => {
    await this.props.createBookmark(
      this.state.slug,
      this.props.auth.user.token
    );
  };
  onStarClick = (nextValue, prevValue, name) => {
    const { rateArticleRequest } = this.props;
    const payload = {
      rating: nextValue,
      articleId: name
    };
    rateArticleRequest(payload);
  };

  handleModalOpen = () => {
    this.setState({ show: true });
  };

  handleModalClose = () => {
    this.setState({ show: false });
  };

  componentDidUpdate() {
    if (
      this.props.article &&
      Object.keys(this.props.article.rating).includes('ratingResponse')
    ) {
      if (this.props.article.rating.ratingResponse.status === 'fail')
        toast.error(this.props.article.rating.ratingResponse.data);
      if (this.props.article.rating.ratingResponse.status === 'success')
        toast.success(
          `You rated this article ${this.props.article.rating.ratingResponse.data.rating} stars`
        );
    }
  }

  handleArticleLike = async () => {
    const { slug } = this.props.match.params;
    await this.props.likeArticle(
      this.props.article.id,
      slug,
      this.props.auth.user.token
    );
  };

  render() {
    const { slug } = this.props.match.params;
    const { auth } = this.props;
    let singleArticle = <Loading />;
    const articleUrl = window.location.href;

    if (!this.props.loading && this.props.article) {
      const {
        id,
        body,
        author,
        likesCount,
        readTime,
        rating,
        title,
        // slug,
        image,
        createdAt,
        Tags
      } = this.props.article;

      const authorName = `${author.firstName} ${author.lastName}`;
      const imageObj = JSON.parse(image);
      const datePublished = moment(createdAt).format('MMMM Do, YYYY');
      singleArticle = singleArticle = (
        <div className="container">
          <div className="row read-article-section">
            <div className="col-sm-12 col-lg-9 article-details">
              <div className="article-image">
                <IconComponent
                  src={imageObj[0]}
                  alt={'image asset'}
                  className="object-fit"
                />
              </div>
              <div className="col-sm-12 article-title">
                <div className="row">
                  <h3>
                    <strong>{title}</strong>
                  </h3>
                </div>
                <div className="row read-article-stat">
                  <div className="row read-article-read-time-container">
                    <div className="read-article-read-time">
                      {datePublished} - {readTime}
                    </div>
                    <div className="read-article-ratings">
                      <StarRatingComponent
                        name="rate1"
                        starCount={5}
                        value={rating.averageRating}
                        editing={false}
                      />
                    </div>
                  </div>
                  {auth.isAuthenticated ? (
                    <div
                      data-tip="Click here to report this article"
                      data-class="report-info"
                      className="read-article-bookmark"
                    >
                      {' '}
                      <IconComponent
                        handleclick={this.handleModalOpen}
                        src={'../../../src/assets/images/report.svg'}
                        alt={'image asset'}
                        className={'read-article-image'}
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>

              <div className="article-body">
                {reactHtmlParser(body)}
                <div className="mt-3 mb-3">
                  {Tags
                    ? Tags.map((tag, i) => {
                        return (
                          <span className="tag" key={i}>
                            {tag.name}
                          </span>
                        );
                      })
                    : ''}
                </div>
                {this.props.auth.user.token ? (
                  <div className="rating">
                    <span>Rate this post</span>
                    <StarRatingComponent
                      name={id.toString()}
                      onStarClick={this.onStarClick}
                      editing={!Object.keys(rating).includes('ratingResponse')}
                    />
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>

            <div className="col-sm-12 col-lg-3 article-details-second">
              <div className="read-article-author-card">
                <Authorcard
                  image="./../src/assets/images/avatar.png"
                  fullname={authorName}
                  handle={author.firstName}
                  bio="This would be a short summary of the users bio, for little interest
display for readers"
                  isFollowing={false}
                  lightTheme={this.props.lightTheme}
                  articleUrl={articleUrl}
                  handleCreateBookmark={this.handleCreateBookmark}
                  slug={this.slug}
                  articleLikesCount={likesCount}
                  handleArticleLike={this.handleArticleLike}
                />
              </div>
            </div>
          </div>
          <div className="row create-comment-section">
            <div className="col-sm-12 col-md-12 create-comment-container">
              <CreateComment {...this.props.match} />
            </div>
          </div>
          <ReportModal
            show={this.state.show}
            lightTheme={this.props.lightTheme}
            handleShow={this.handleModalShow}
            handleClose={this.handleModalClose}
          >
            <ReportArticleForm
              handleClose={this.handleModalClose}
              reportArticleRequest={reportArticleRequest}
              slug={slug}
              token={auth.user.token}
            ></ReportArticleForm>
          </ReportModal>
          <ToolTip />
        </div>
      );
    }
    return singleArticle;
  }
}

ReadArticle.propTypes = {
  id: PropTypes.number,
  slug: PropTypes.string,
  token: PropTypes.string,
  auth: PropTypes.object,
  lightTheme: PropTypes.bool,
  loading: PropTypes.bool,
  match: PropTypes.object,
  params: PropTypes.object,
  error: PropTypes.object,
  fetchSingleArticle: PropTypes.func,
  article: PropTypes.object,
  getAllUserBookmarks: PropTypes.func,
  bookmark: PropTypes.any,
  createBookmark: PropTypes.func,
  rateArticleRequest: PropTypes.func,
  cleanUpRating: PropTypes.func,
  fetchArticleComment: PropTypes.func,
  likeArticle: PropTypes.func,
  likesCount: PropTypes.number,
  user: PropTypes.object,
  reportArticleRequest: PropTypes.func
};
export const mapStateToProps = state => {
  return {
    lightTheme: state.theme.theme === 'light-theme',
    article: state.readArticle.article,
    loading: state.readArticle.loading,
    auth: state.auth,
    allComment: state.commentOnArticle.allComment
  };
};

export const mapDispatchToProps = dispatch => {
  return {
    fetchSingleArticle: slug => dispatch(getSingleArticle(slug)),
    createBookmark: (slug, token) => dispatch(createBookmark(slug, token)),
    rateArticleRequest: (payload, token) => {
      dispatch(rateArticleRequest(payload, token));
    },
    cleanUpRating: () => dispatch(cleanUpRating()),
    likeArticle: (id, slug, token) => dispatch(articleLike(id, slug, token)),
    reportArticleRequest: (slug, reason, token) =>
      dispatch(reportArticleRequest(slug, reason, token))
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReadArticle);
