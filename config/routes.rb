Rails.application.routes.draw do
  root 'home#index'

  scope '/games' do
    get '/space_garbage_warrior_2988', to: 'games#space_garbage_warrior', as: 'space_garbage_warrior'
    get '/homebreaker', to: 'games#homebreaker', as: 'homebreaker'
    get '/maggie', to: 'games#maggie', as: 'maggie'
    get '/immortal_legion', to: 'games#immortal_legion', as: 'immortal_legion'
  end
end
