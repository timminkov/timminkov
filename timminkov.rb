require 'sinatra'

get "/" do
  erb :welcome
end


class Timminkov < Sinatra::Base

  set :public_folder => "public", :static => true

  get "/" do
    erb :welcome
  end
end
