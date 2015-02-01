class GamesController < ApplicationController

  def space_garbage_warrior; end

  def homebreaker; end

  def maggie
    @images = Dir.glob("public/images/maggie/*.gif")
  end

  def immortal_legion
    render layout: 'immortal_legion'
  end

end
